DELIMITER $$

DROP EVENT IF EXISTS BidPolimi;
CREATE EVENT BidPolimi
ON SCHEDULE EVERY 1 SECOND
DO
BEGIN




	-- Variabili
	DECLARE vContaAutoBiddate INT;		

	-- Conta AutoBiddata
	SELECT COUNT(A.IdAutoBid) AS ContaAutoBiddate
	INTO vContaAutoBiddate
	FROM aste_autobid A
	JOIN bp_aste_riepilogo R ON (A.IdAsta=R.IdAsta)
	WHERE A.MaxValue>R.OffertaTotale AND A.MinValue<=R.OffertaTotale AND A.Attivo=1 AND A.NumBidRimanenti>0 AND R.SecondiFineAsta<7 AND R.SecondiFineAsta>-100;


	IF (vContaAutoBiddate>0) THEN
		CALL PopolaAutoBid();
	END IF;


	-- Termina Asta
	UPDATE BidPolimi.bp_aste_riepilogo AS R JOIN BidPolimi.aste_anagrafe AS A ON R.IdAsta=A.IdAsta
	SET A.DataUltimata=NOW() WHERE R.SecondiFineAsta<=-1 AND A.DataUltimata IS NULL;

	-- Ritorna Autobid
	UPDATE BidPolimi.aste_autobid AS B 
	JOIN BidPolimi.aste_anagrafe AS A ON B.IdAsta=A.IdAsta
	JOIN BidPolimi.utenti_anagrafe AS U ON B.IdUtente=U.IdUtente	
	SET U.NumBid=U.NumBid+B.NumBidRimanenti, B.Attivo=(IF(B.Attivo=1, 0, 2)) WHERE (B.Attivo=1 AND A.DataUltimata IS NOT NULL) OR B.Attivo=3;

	

END$$
