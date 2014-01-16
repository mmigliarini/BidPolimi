

var URL_HOME = new String ('h.q') 	// Indirizzo per l'ottenimento dei dati della lista
var URL_ASTA = new String ('p.q') 	// Indirizzo per l'ottenimento dei dati dell'asta
var URL_MBID = new String ('b.q') 	// Indirizzo per biddata maniale


var SEP_TIME = '#';	// Separatore dati aste - liveserver time
var SEP_ASTE = ';';	// Separatore dati primo livello in caso di più aste
var SEP_ITEM = ','; 	// Separatore dati ultimo livello (indipendentemente che sia il secondo o il terzo)
var SEP_MBID = '|'; 	// Separatore BidPrice();


var TR1_A = 0;	// IdAsta
var TR1_S = 1;	// Secondi Rimanenti
var TR1_T = 2;	// Incremento Tempo
var TR1_U = 3;	// Utente vincitore
var TR1_O = 4;	// Offerta corrente


var TR2_A = 0;	// IdAsta
var TR2_S = 1;	// Secondi Rimanenti
var TR2_T = 2;	// Incremento Tempo
var TR2_U = 3;	// Utente vincitore
var TR2_O = 4;	// Offerta corrente
var TR2_L = 5;	// Prossimo limite offerta
var TR2_I = 6;	// Prossimo incremento al raggiungimento del Limite



var TR3_U = 0;	// Utente Offerta
var TR3_O = 1;	// Importo Offerta
var TR3_T = 2;	// Tipo Offerta (0: bid manuale, 1: agente)






var xmlhttpElenco = null;
var xmlhttpBidPrice = null;
var xmlhttpAsta = null;






function ClickClear(thisfield, defaulttext) {
	if (thisfield.value == defaulttext) {

		thisfield.value = "";
		thisfield.className = "input_black";

	}
}

function ClickRecall(thisfield, defaulttext) {
	if (thisfield.value == "") {

		thisfield.value = defaulttext;
		thisfield.className = "input_gray";
	}
}





function BPAgente() {


	if(document.getElementById("agente_1")){	
		document.getElementById("agente_1").value = document.getElementById("agente_es_1").innerHTML;
		document.getElementById("agente_2").value = document.getElementById("agente_es_2").innerHTML;
		document.getElementById("agente_3").value = document.getElementById("agente_es_3").innerHTML;
	}


}


/*
 * OVERVIEW: BidPrice, regloa i rilanci
 * Requires: iIdAsta, bhome, sElenco
 *  Effects: -
 * Modifies: xmlhttpBidPrice, sURLCompleto
 *
 */
function BidPrice(iIdAsta, bHome, sElenco){

	// d è il numero di millisec. della data attuale del client.
	// sURLCompleto è l'url completo da chiamare tramite XMLHttpRequest() 
	if(bHome){                                                                            
		var sURLCompleto = URL_MBID + "?aid=" + iIdAsta + "&h=" + sElenco + "&d=" + new Date().valueOf();
	}else{
		var sURLCompleto = URL_MBID + "?aid=" + iIdAsta + "&d=" + new Date().valueOf();
	}  		
          
                                                                               
	if (xmlhttpBidPrice){
		if ((xmlhttpBidPrice.readyState != 4) && (xmlhttpBidPrice.readyState != 0)) return true;
	}

    	try{	
        	if (window.XMLHttpRequest)	xmlhttpBidPrice = new XMLHttpRequest();				// code for all new browsers
        	else if (window.ActiveXObject)	xmlhttpBidPrice = new ActiveXObject("Microsoft.XMLHTTP");	// code for IE5 and IE6
      

        	if (xmlhttpBidPrice != null){

	        	xmlhttpBidPrice.onreadystatechange = BidPriceChange;
	        	xmlhttpBidPrice.open("GET",sURLCompleto,true);
	        	xmlhttpBidPrice.send(null);
	        	//return true;

        	}else{
	        	if (bDebug)	alert("Your browser does not support XMLHTTP.");

		        return false;
		}
    	
	}catch (e){
        	xmlhttpBidPrice = null;
        	if (bDebug) alert('Errore in loadXMLDocElenco');
    	}

    	finally {}
}



//
function BidPriceChange(){
	
	if (xmlhttpBidPrice.readyState==4){		// 4 = "loaded"
		
		if (xmlhttpBidPrice.status==200){		// 200 = OK
				if(xmlhttpBidPrice.responseText!=""){

					var BPDati = xmlhttpBidPrice.responseText.split(SEP_MBID);

					if(BPDati[0]!=""){
						alert(BPDati[0]);					
					}else if(BPDati[1]=="1"){
						
						clearTimeout(BPTime);
						BPProcessaElenco(BPDati[2]);
						setTimeout(BPElenco, 1000);
					
					}else if(BPDati[1]=="2"){

						clearTimeout(BPTime);
						BPProcessaAsta(BPDati[2]);
						setTimeout(BPAsta, 1000);

					}


				}
		}else{
			if (bDebug) 	alert("Problem retrieving XML data");
		}
  	}
}






//
function BPAggiornaElenco(sElencoAste){

	// d è il numero di millisec. della data attuale del client.                                                                                     
	var sURLCompleto = URL_HOME + "?id=" + sElencoAste + "&d=" + new Date().valueOf();    		
                                                                                         
	if (xmlhttpElenco){
		if ((xmlhttpElenco.readyState != 4) && (xmlhttpElenco.readyState != 0)) return true;
	}

    	try{	
        	if (window.XMLHttpRequest)	xmlhttpElenco = new XMLHttpRequest();				// code for all new browsers
        	else if (window.ActiveXObject)	xmlhttpElenco = new ActiveXObject("Microsoft.XMLHTTP");		// code for IE5 and IE6
      

        	if (xmlhttpElenco != null){

	        	xmlhttpElenco.onreadystatechange = BPSelezionaElenco;
	        	xmlhttpElenco.open("GET",sURLCompleto,true);
	        	xmlhttpElenco.send(null);
	        	return true;

        	}else{
	        	if (bDebug)	alert("Your browser does not support XMLHTTP.");

		        return false;
		}
    	
	}catch (e){
        	xmlhttpElenco = null;
        	if (bDebug) alert('Errore in loadXMLDocElenco');
    	}

    finally {}
}









//
function BPSelezionaElenco(){
	
	if (xmlhttpElenco.readyState==4){		// 4 = "loaded"
		
		if (xmlhttpElenco.status==200){		// 200 = OK
				
			BPProcessaElenco(xmlhttpElenco.responseText);
		}else{
			if (bDebug) 	alert("Problem retrieving XML data");
		}
  	}
}




//
function BPProcessaElenco(sResponse){


try{
        
		var iAste;
		var dati = sResponse.split(SEP_TIME);
		var aste = dati[0].split(SEP_ASTE);


		document.getElementById("div_ora_live_server").innerHTML = dati[1];

		if (document.getElementById("CoinsRimanenti")){
			document.getElementById("CoinsRimanenti").innerHTML = dati[2];
		}


		for (iAste = 0; iAste < aste.length; iAste++){
		


			var asta = aste[iAste].split(SEP_ITEM);
  		
			div_A = "A"+asta[TR1_A];	// Asta	Small
			div_M = "M"+asta[TR1_A];	// Asta Main
			div_O = "O"+asta[TR1_A];	// Offerta
			div_U = "U"+asta[TR1_A];	// Utente
			div_S = "S"+asta[TR1_A];	// Tempo restante
			div_I = "I"+asta[TR1_A];	// Immagine Orologio
			div_B = "B"+asta[TR1_A];	// Immagine Bottone Rilancia/Ultimata/Ordina
			div_T = "T"+asta[TR1_A];	// Incremento tempo   (s)



			if(document.getElementById("UtenteLoggato")){
	
				if(document.getElementById("UtenteLoggato").innerHTML == asta[TR1_U]){
					if(asta[TR1_S]==-100)	document.getElementById(div_B).src = "pics/bt_acquista.png";
					else			document.getElementById(div_B).src = "pics/bt_rilancia_off.png";
				} else {
					if(asta[TR1_S]==-100)	document.getElementById(div_B).src = "pics/bt_ultimata.png";
					else			document.getElementById(div_B).src = "pics/bt_rilancia_on.png";					
				}


			} else {

				document.getElementById(div_B).src = "pics/bt_rilancia_on.png";

			}


			if (document.getElementById(div_M)){


				if(asta[TR1_S]>=0){

					if(asta[TR1_S]>=600){
						document.getElementById(div_M).className = "asta_main blue";
						document.getElementById(div_I).src = "pics/clockbig.png";
						document.getElementById(div_S).style.color = "#1D303F";
					}else{
						document.getElementById(div_M).className = "asta_main red";
						document.getElementById(div_I).src = "pics/clockbig_red.png";
						document.getElementById(div_S).style.color = "#CC0000";
					}



				} else {
				
					if(asta[TR1_S]==-100){

						if(document.getElementById("UtenteLoggato").innerHTML == asta[TR1_U]){
							document.getElementById(div_M).className = "asta_main green";
						} else {					
							document.getElementById(div_M).className = "asta_main gray";
						}
						document.getElementById(div_I).src = "pics/clockbig_gray.png";
						document.getElementById(div_S).style.color = "#1D303F";
					}
					asta[TR1_S]=0;
				}


				document.getElementById(div_T).innerHTML = asta[TR1_T];


			}else {


				if(asta[TR1_S]>=0){

					if(asta[TR1_S]>=600){
						document.getElementById(div_A).className = "asta_small blue";
						document.getElementById(div_I).src = "pics/clocksmall.png";
						document.getElementById(div_S).style.color = "#1D303F";
					}else{
						document.getElementById(div_A).className = "asta_small red";
						document.getElementById(div_I).src = "pics/clocksmall_red.png";
						document.getElementById(div_S).style.color = "#CC0000";
					}



				} else {
				
					if(asta[TR1_S]==-100){

						if(document.getElementById("UtenteLoggato").innerHTML == asta[TR1_U]){
							document.getElementById(div_A).className = "asta_small green";
						} else {					
							document.getElementById(div_A).className = "asta_small gray";
						}
						document.getElementById(div_I).src = "pics/clocksmall_gray.png";
						document.getElementById(div_S).style.color = "#1D303F";
					}
					asta[TR1_S]=0;
				}			

			}



			var dt = new Date(0,0,0);
			dt.setSeconds(asta[TR1_S]);       // Aggiungo s (anche maggiore di 60). JS converte in h, m e s.


			var iOreGiorno = dt.getDay() * 24
			//var sTimeValue = FormattaOra(iOreGiorno + dt.getHours(),dt.getMinutes(),dt.getSeconds());

			if(asta[TR2_S]/86400>=1)
				var sTimeValue = parseInt(asta[TR2_S]/86400) + "g " + FormattaOra(dt.getHours(),dt.getMinutes(),dt.getSeconds());
			else
				var sTimeValue = FormattaOra(dt.getHours(),dt.getMinutes(),dt.getSeconds());
				
			
			var old_offerta = document.getElementById(div_O).innerHTML;
                    	var new_offerta = asta[TR1_O].replace(".", ",")+" €";



			//EFFETTO FADE su Prezzo cambiato
			if (old_offerta != new_offerta) {
				document.getElementById(div_O).className = "prezzo_small_red";
			}
			else {
				document.getElementById(div_O).className = "prezzo_small";
			}



			document.getElementById(div_O).innerHTML = new_offerta;
			document.getElementById(div_U).innerHTML = asta[TR1_U];
			document.getElementById(div_S).innerHTML = sTimeValue;


   		}
	}catch (e){
		//clearData(sResponse)
		//if (bDebug) alert(e.Message);        
   	}

    finally {}

}















//
function BPAggiornaAsta(iIdAsta){

	// d è il numero di millisec. della data attuale del client.                                                                                     
	var sURLCompleto = URL_ASTA + "?aid=" + iIdAsta + "&d=" + new Date().valueOf();    		
           
                                                                              
	if (xmlhttpAsta){
		if ((xmlhttpAsta.readyState != 4) && (xmlhttpAsta.readyState != 0)) return true;
	}

    	try{	
        	if (window.XMLHttpRequest)	xmlhttpAsta = new XMLHttpRequest();				// code for all new browsers
        	else if (window.ActiveXObject)	xmlhttpAsta = new ActiveXObject("Microsoft.XMLHTTP");		// code for IE5 and IE6
      

        	if (xmlhttpAsta != null){

	        	xmlhttpAsta.onreadystatechange = BPSelezionaAsta;
	        	xmlhttpAsta.open("GET",sURLCompleto,true);
	        	xmlhttpAsta.send(null);
	        	return true;

        	}else{
	        	if (bDebug)	alert("Your browser does not support XMLHTTP.");

		        return false;
		}
    	
	}catch (e){
        	xmlhttpAsta = null;
        	if (bDebug) alert('Errore in loadXMLDocElenco');
    	}

    finally {}
}









//
function BPSelezionaAsta(){
	
	if (xmlhttpAsta.readyState==4){		// 4 = "loaded"
		
		if (xmlhttpAsta.status==200){		// 200 = OK
				
			BPProcessaAsta(xmlhttpAsta.responseText);
		}else{
			if (bDebug) 	alert("Problem retrieving XML data");
		}
  	}
}



//
function BPProcessaAsta(sResponse){


try{


		var dati = sResponse.split(SEP_TIME);
		var asta = dati[0].split(SEP_ITEM);




		document.getElementById("div_ora_live_server").innerHTML = dati[1];

		if (document.getElementById("CoinsRimanenti")){
			document.getElementById("CoinsRimanenti").innerHTML = dati[3];
		}


  		
		div_A = "A"+asta[TR2_A];	// Asta	Pagina
		div_O = "O"+asta[TR2_A];	// Offerta
		div_U = "U"+asta[TR2_A];	// Utente
		div_S = "S"+asta[TR2_A];	// Tempo restante
		div_I = "I"+asta[TR2_A];	// Immagine Orologio
		div_B = "B"+asta[TR2_A];	// Immagine Bottone Rilancia/Ultimata/Ordina
		div_T = "T"+asta[TR2_A];	// Incremento tempo   (s)
		div_C = "C"+asta[TR2_A];	// Coins offerti in questa asta
		div_N = "N"+asta[TR2_A];	// Coins offerti in questa asta		


		if (document.getElementById(div_C)){
			document.getElementById(div_C).innerHTML = dati[4] + " ";
		}



		if(document.getElementById("UtenteLoggato")){

			if(document.getElementById("UtenteLoggato").innerHTML == asta[TR2_U]){
				if(asta[TR2_S]==-100)	document.getElementById(div_B).src = "pics/bt_acquista.png";
				else			document.getElementById(div_B).src = "pics/bt_rilancia_off.png";
			} else {
				if(asta[TR2_S]==-100)	document.getElementById(div_B).src = "pics/bt_ultimata.png";
				else			document.getElementById(div_B).src = "pics/bt_rilancia_on.png";					
				
			}

		} else {
			if(asta[TR2_S]==-100)	document.getElementById(div_B).src = "pics/bt_ultimata.png";
			else			document.getElementById(div_B).src = "pics/bt_rilancia_on.png";	
		}




		if (document.getElementById(div_N)){

			if (asta[TR2_L]!=0) document.getElementById(div_N).innerHTML = "<img src=pics/icon_hand_clock.png style='float: left; padding-left: 20px; margin-top: 2px; margin-right: 10px'> Al raggiungimento di <b>"+asta[TR2_L].replace(".", ",")+" €</b><br>il tempo si incrementa di <b>"+asta[TR2_I]+" sec</b>";
			else 		    document.getElementById(div_N).innerHTML = "";
		}




		if(asta[TR2_S]>=0){

			if(asta[TR2_S]>=600){
				document.getElementById(div_A).className = "asta_page blue";
				document.getElementById(div_I).src = "pics/clockbig.png";
				document.getElementById(div_S).style.color = "#1D303F";
			}else{
				document.getElementById(div_A).className = "asta_page red";
				document.getElementById(div_I).src = "pics/clockbig_red.png";
				document.getElementById(div_S).style.color = "#CC0000";
			}



		} else {
				
			if(asta[TR2_S]==-100){

				if(document.getElementById("UtenteLoggato").innerHTML == asta[TR2_U]){
					document.getElementById(div_A).className = "asta_page green";
				} else {					
					document.getElementById(div_A).className = "asta_page blue";
				}
					document.getElementById(div_I).src = "pics/clockbig_gray.png";
					document.getElementById(div_S).style.color = "#1D303F";
				}
			asta[TR2_S]=0;
		}			





			var dt = new Date(0,0,0);
			dt.setSeconds(asta[TR2_S]);       // Aggiungo s (anche maggiore di 60). JS converte in h, m e s.


			var iOreGiorno = dt.getDay() * 24
			//var sTimeValue = FormattaOra(iOreGiorno + dt.getHours(),dt.getMinutes(),dt.getSeconds());
			//var sTimeValue = asta[TR2_S];
			
			if(asta[TR2_S]/86400>=1)
				var sTimeValue = parseInt(asta[TR2_S]/86400) + "g " + FormattaOra(dt.getHours(),dt.getMinutes(),dt.getSeconds());
			else
				var sTimeValue = FormattaOra(dt.getHours(),dt.getMinutes(),dt.getSeconds());


			var old_offerta = document.getElementById(div_O).innerHTML;
                    	var new_offerta = asta[TR2_O].replace(".", ",")+" €";



			//EFFETTO FADE su Prezzo cambiato
			if (old_offerta != new_offerta) {
				document.getElementById(div_O).className = "prezzo_small_red";
			}
			else {
				document.getElementById(div_O).className = "prezzo_small";
			}


			document.getElementById(div_T).innerHTML = asta[TR2_T];
			document.getElementById(div_U).innerHTML = asta[TR2_U];
			document.getElementById(div_O).innerHTML = new_offerta;	
			document.getElementById(div_S).innerHTML = sTimeValue;



	
		// COMPILAZIONE AUTOMATICA FORM AUTOBID
		if (document.getElementById("agente_es_1")){
			
			var offerta_agente = parseFloat(asta[TR2_O]);
			offerta_agente = offerta_agente + 10;
			offerta_agente = Math.round(offerta_agente*100)/100;

			offerta_agente = offerta_agente.toString();
	
			document.getElementById("agente_es_1").innerHTML = asta[TR2_O].replace(".", ",");
			document.getElementById("agente_es_2").innerHTML = offerta_agente.replace(".", ",");

		}




		// COMPILAZIONE DIV OFFERTE
		var iOfferte;
		var sOfferte;

		sOfferte = "<table width=200 cellpadding=5 cellSpacing=1 bgColor=#D8D9DA class=testo_grigio_11>";

		var offerte = dati[2].split(SEP_ASTE);


		for (iOfferte = 0; iOfferte < offerte.length; iOfferte++){

			var offerta = offerte[iOfferte].split(SEP_ITEM);


			if(iOfferte%2==0){		// COLORE SFONDO RIGHE ALTERNE
				bgColor="#FFFFFF";
			}else{	
				bgColor="#EEEEEE";
			}			


			if(offerta[2]==0){
				imgSrc="pics/man.png";	// 0: BID MANUALE
			}else{	
				imgSrc="pics/auto.png";	// 1: AUTOBID
			}
	

			sOfferte = sOfferte +"<tr><td bgcolor="+bgColor+" height=18 width=25><center><img src="+imgSrc+"></center></td>";
			sOfferte = sOfferte +"<td bgcolor="+bgColor+" height=18 width=60><center>"+offerta[TR3_O].replace(".", ",")+" €</td>";
			sOfferte = sOfferte +"<td bgcolor="+bgColor+" height=18 width=115 align=left> "+offerta[TR3_U]+"</td></tr>";



		}



		sOfferte=sOfferte+"</table>";

		document.getElementById("div_offerte").innerHTML = sOfferte;














	}catch (e){
		//clearData(sResponse)
		//if (bDebug) alert(e.Message);        
   	}

    finally {}

}

























//
function FormattaOra(sOre, sMinuti, sSecondi){
    // Correggo le lunghezza in modo che siano tutte di 2 caratteri.   
    return (sOre > 9 ? sOre : '0' + sOre) + ':' + (sMinuti > 9 ? sMinuti : '0' + sMinuti) + ':' + (sSecondi > 9 ? sSecondi : '0' + sSecondi);
    
}






