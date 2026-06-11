-- 100 sessioni di test con dediche
DO $$
DECLARE
  nomi TEXT[] := ARRAY['Luca','Sara','Marco','Giulia','Paolo','Anna','Davide','Chiara','Matteo','Elena',
    'Roberto','Francesca','Antonio','Valentina','Giuseppe','Silvia','Alessandro','Laura','Francesco','Marta',
    'Simone','Federica','Andrea','Beatrice','Riccardo','Alice','Stefano','Ilaria','Michele','Caterina',
    'Lorenzo','Sofia','Nicola','Martina','Fabio','Alessia','Daniele','Giorgia','Emanuele','Roberta',
    'Luca B','Zia Anna','Don Pietro','Suor Maria','Nonno Silvio','Nonna Sara','Zio Mario','Zia Giovanna',
    'Cugino Enrico','Cugina Lucia'];
  testi TEXT[] := ARRAY[
    'Congratulazioni Don Samuele! Sei una persona meravigliosa.',
    'Ti voglio bene! Che questo giorno sia solo l''inizio di un cammino bellissimo.',
    'Finalmente Don Samuele! Siamo tutti così orgogliosi di te.',
    'Grazie per la tua dedizione e il tuo sorriso contagioso!',
    'Il Signore ti benedica in ogni passo del tuo cammino.',
    'Che gioia condividere questo giorno con te! Auguri di cuore.',
    'Un sacerdote con il cuore grande come il tuo è un dono per tutti.',
    'Mesenzana è orgogliosa di te! Buona Prima Messa.',
    'Ricorderemo sempre questo giorno speciale. Auguri!',
    'La tua fede è un esempio per noi tutti. Grazie Don Samuele!',
    'Sei un regalo per la nostra comunità. Auguri vivissimi!',
    'Con affetto e ammirazione, auguri per questo grande giorno.',
    'Ciao Don Samuele! Sei sempre nel nostro cuore.',
    'Un abbraccio grande quanto il tuo sorriso. Congratulazioni!',
    'Che il Signore ti guidi sempre. Auguri di tutto cuore!'];
  i INT;
  sess_id UUID;
  nome_scelto TEXT;
  punteggio_val INT;
  tempo_val INT;
  testo_scelto TEXT;
BEGIN
  FOR i IN 1..100 LOOP
    nome_scelto := nomi[1 + (random()*49)::INT];
    punteggio_val := (random()*10)::INT;
    tempo_val := 30 + (random()*270)::INT;
    INSERT INTO sessions (nome, punteggio, totale_domande, tempo_secondi, created_at)
    VALUES (nome_scelto, punteggio_val, 10, tempo_val, now() - (random()*3600 || ' seconds')::INTERVAL)
    RETURNING id INTO sess_id;

    -- 70% chance di avere anche una dedica
    IF random() > 0.3 THEN
      testo_scelto := testi[1 + (random()*14)::INT];
      INSERT INTO dediche (session_id, nome_firma, testo, created_at)
      VALUES (sess_id, nome_scelto, testo_scelto, now() - (random()*3600 || ' seconds')::INTERVAL);
    END IF;
  END LOOP;
END $$;
