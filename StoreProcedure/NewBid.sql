DROP PROCEDURE IF EXISTS InserisciOfferta;
CREATE PROCEDURE InserisciOfferta(IN vIdAsta INT, IN vIdUtente INT, IN vTipoOfferta INT, IN vNumBidAutoBiddata INT, IN vMinValue FLOAT, IN vMaxValue FLOAT, OUT sMessaggio VARCHAR(255))
BEGIN
	
		-- Variabili
		DECLARE vContaBidDisponibili, vIsUltimata, vIdUtenteVincitore INT;
		DECLARE vOffertaTotale FLOAT;

	
		-- Dichiarazione Transizione
		START TRANSACTION;


			SET vIdUtenteVincitore = 0;


			-- ContaBidDisponibili
			SELECT NumBid
			INTO vContaBidDisponibili
			FROM utenti_anagrafe 
 			WHERE IdUtente=vIdUtente LIMIT 1;


			-- DataUltimata
			SELECT COUNT(DataUltimata) AS Conta
			INTO vIsUltimata
			FROM aste_anagrafe 
			WHERE DataUltimata IS NOT NULL AND IdAsta=vIdAsta;


			-- IdUtenteVincitore
			SELECT IdUtente
			INTO vIdUtenteVincitore
			FROM bp_aste_riepilogo
			WHERE IdAsta=vIdAsta LIMIT 1;


	
			
			IF (vIsUltimata = 0) THEN
			

				IF (vTipoOfferta = 0) THEN	-- Biddata Manuale
					
					IF (vIdUtenteVincitore = vIdUtente) THEN
						SET sMessaggio = "STAI VINCENDO";
					END IF;

					IF (vContaBidDisponibili<1) THEN
						SET sMessaggio = "CREDITO INSUFFICIENTE";
					END IF;



					IF ((vIdUtenteVincitore <> vIdUtente OR ISNULL(vIdUtenteVincitore)) AND (vContaBidDisponibili>=1)) THEN

						-- Inserisci Offerta
						INSERT INTO aste_offerte (IdAsta, IdUtente, Data, Tipo)
						VALUES (vIdAsta, vIdUtente, NOW(), 0);

						-- Aggiorna Bid Residui
						UPDATE utenti_anagrafe 
						SET NumBid=(NumBid-1)
						WHERE IdUtente=vIdUtente;

						-- Aggiorna Valore Offerta Asta
						UPDATE aste_anagrafe AS A
						JOIN bp_aste_riepilogo AS R ON (A.IdAsta=R.IdAsta)
						SET A.Offerta=(A.Offerta + A.IncrementoOfferta), A.IdUtente=vIdUtente, A.DataFineAstaNew=(IF(R.SecondiFineAsta>=R.IncrementoTempo, DATE_ADD(A.DataFineAstaNew,INTERVAL R.IncrementoTempo SECOND), DATE_ADD(NOW(),INTERVAL R.IncrementoTempo SECOND)))
						WHERE A.IdAsta=vIdAsta;

					END IF;



				ELSEIF (vTipoOfferta = 1) THEN	-- Inserimento AutoBiddata

					-- vOffertaTotale
					SELECT (Offerta+PrezzoInizio) 
					INTO vOffertaTotale
					FROM aste_anagrafe
					WHERE IdAsta=vIdAsta;

					IF (vOffertaTotale >  vMinValue) THEN
						SET sMessaggio = "ERR1";				-- Offerta Iniziale troppo bassa
					ELSEIF (vOffertaTotale > vMaxValue) THEN
						SET sMessaggio = "ERR2";				-- Offerta Finale troppo bassa
					ELSEIF (vContaBidDisponibili<vNumBidAutoBiddata) THEN
						SET sMessaggio = "ERR3";				-- Numero Bid non sufficienti

					ELSE

						-- Inserisci AutoBiddata
						INSERT INTO aste_autobid (Data, IdAsta, IdUtente, MinValue, MaxValue, NumBid, NumBidRimanenti, Attivo)
						VALUES (NOW(), vIdAsta, vIdUtente, vMinValue, vMaxValue, vNumBidAutoBiddata, vNumBidAutobiddata, 1);

						-- Aggiorna Bid Residui
						UPDATE utenti_anagrafe 
						SET NumBid=(NumBid-vNumBidAutoBiddata)
						WHERE IdUtente=vIdUtente;


					END IF;

				END IF;



			ELSE

				SET sMessaggio = "ASTA ULTIMATA";

			END IF;





	-- Debug
	-- SELECT CONCAT("Incremento: ", vIncrementoOfferta);
	-- SELECT CONCAT("ContaBiddate: ", vContaBiddate);
	-- SELECT CONCAT("ValoreOfferta: ", vValoreOfferta);
	-- SELECT CONCAT("IdUtenteVincitore: ", vIdUtenteVincitore);




	COMMIT;



END
