DROP PROCEDURE IF EXISTS PopolaAutoBid;
CREATE PROCEDURE PopolaAutoBid()
BEGIN


		-- Variabili
		DECLARE vIdAsta, vContaAutoBiddate INT;
		DECLARE vCercaAutoBiddate, vIdUtenteVincitore INT;
		DECLARE vValoreOfferta, vMaxValue FLOAT;
		DECLARE vIdAutoBid, vIdUtenteAutoBiddata, vBidAutoBiddata INT;

		-- Fine CursorSQL
		DECLARE done INT;					



		-- Cursor: Cerca e Conta AutoBiddata
		DECLARE CursorSQL_1 CURSOR FOR
		SELECT A.IdAsta, COUNT(A.IdAutoBid) AS ContaAutoBiddate
		FROM aste_autobid A
		JOIN bp_aste_riepilogo R ON (A.IdAsta=R.IdAsta)
		WHERE A.MaxValue>R.OffertaTotale AND A.MinValue<=R.OffertaTotale AND A.Attivo=1 AND A.NumBidRimanenti>0 AND R.SecondiFineAsta<7 AND R.SecondiFineAsta>-100
		GROUP BY(A.IdAsta)
		HAVING COUNT(A.IdAutoBid)>0;


		-- Cursor: Scorri AutoBiddate per IdAsta
		DECLARE CursorSQL_2 CURSOR FOR
		SELECT A.IdAutoBid, A.IdUtente
		FROM aste_autobid A
		JOIN bp_aste_riepilogo R ON (A.IdAsta=R.IdAsta)
		WHERE A.MaxValue>R.OffertaTotale AND A.MinValue<=R.OffertaTotale AND A.Attivo=1 AND A.NumBidRimanenti>0 AND R.SecondiFineAsta>-100 AND A.IdAsta=vIdAsta;

		DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;




		-- Dichiarazione Transizione
		START TRANSACTION;


			SET vIdUtenteVincitore = 0;
			SET vCercaAutoBiddate  = 0;



			-- CONTROLLO AUTOBIDDATE: INIZIO
			OPEN CursorSQL_1;

			-- Scorri CursorSQL_1: inizio
			LOOP1: LOOP 		

				FETCH CursorSQL_1 INTO vIdAsta, vContaAutoBiddate;

				-- Esci dal Primo ciclo (LOOP1)
				IF done THEN
					CLOSE CursorSQL_1;
					LEAVE LOOP1;
				END IF;


				-- SELECT vIdAsta, vContaAutoBiddate;

				-- CONTROLLO AUTOBIDDATE: INIZIO
				WHILE (vCercaAutoBiddate=0) DO

					-- SELECT "Entro in AutoBiddate";


						-- ContaAutoBiddate
       						SELECT COUNT(*) AS ContaAutoBiddate
						INTO vContaAutoBiddate
						FROM aste_autobid A
						JOIN bp_aste_riepilogo R ON (A.IdAsta=R.IdAsta)
						WHERE A.MaxValue>R.OffertaTotale 
						AND A.MinValue<=R.OffertaTotale 
						AND A.Attivo=1 
						AND A.NumBidRimanenti>0 
						AND R.SecondiFineAsta>-100 AND A.IdAsta=vIdAsta;					 
		 

						IF(vContaAutoBiddate > 0) THEN
				
		
							OPEN CursorSQL_2;
							
	
							-- Scorri CursorSQL_2: inizio
							LOOP2: LOOP

								FETCH CursorSQL_2 INTO vIdAutoBid, vIdUtenteAutoBiddata;

								IF done THEN
									SET done = 0;
									CLOSE CursorSQL_2;
									LEAVE LOOP2;
								END IF;


								-- IdUtenteVincitore
								SELECT IdUtente, OffertaTotale
								INTO vIdUtenteVincitore, vValoreOfferta
								FROM bp_aste_riepilogo
								WHERE IdAsta=vIdAsta LIMIT 1;


								IF (vIdUtenteVincitore<>vIdUtenteAutoBiddata OR ISNULL(vIdUtenteVincitore)) THEN
								

									-- BidAutoBiddata
									SELECT NumBidRimanenti, MaxValue
									INTO vBidAutoBiddata, vMaxValue
									FROM aste_autobid
									WHERE IdUtente=vIdUtenteAutoBiddata AND IdAutoBid=vIdAutoBid AND NumBidRimanenti>0 AND Attivo=1;

								
									IF (vBidAutoBiddata>0 AND vValoreOfferta<vMaxValue) THEN
				
										-- Inserisci Offerta
										INSERT INTO aste_offerte (IdAsta, IdUtente, Data, Tipo)
										VALUES (vIdAsta, vIdUtenteAutoBiddata, NOW(), 1); 


										-- Aggiorna NumBidRimanenti.Aste_Autobid
										UPDATE aste_autobid
										SET NumBidRimanenti=(NumBidRimanenti-1)
										WHERE IdUtente=vIdUtenteAutoBiddata AND IdAutoBid=vIdAutoBid;


										-- Aggiorna Valore Offerta Asta
										UPDATE aste_anagrafe AS A
										JOIN bp_aste_riepilogo AS R ON (A.IdAsta=R.IdAsta)
										SET A.Offerta=(A.Offerta + A.IncrementoOfferta), A.IdUtente=vIdUtenteAutoBiddata, A.DataFineAstaNew=IF(R.SecondiFineAsta>=R.IncrementoTempo, DATE_ADD(A.DataFineAstaNew,INTERVAL R.IncrementoTempo SECOND), DATE_ADD(NOW(),INTERVAL R.IncrementoTempo SECOND))
										WHERE A.IdAsta=vIdAsta;


										-- CercaAutoBiddate
										SET vCercaAutoBiddate = 0;

									ELSE

										-- CercaAutoBiddate
										SET vCercaAutoBiddate = 1;

									END IF;


								ELSE
									
									-- CercaAutoBiddate
									SET vCercaAutoBiddate = 1;				
											
								END IF;



							END LOOP LOOP2;
							-- Scorri CursorSQL_2: fine




						ELSE 

							-- CercaAutoBiddate
							SET vCercaAutoBiddate = 1;	

						END IF;



				END WHILE;
				-- CONTROLLO AUTOBIDDATE: FINE



			END LOOP LOOP1;
			-- Scorri CursorSQL_1: fine





	COMMIT;



END;

