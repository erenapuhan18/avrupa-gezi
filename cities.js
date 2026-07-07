const CITIES = [
  {
    name: "Paris", country: "Fransa", slug: "paris", query: "Paris landmark", lat: 48.8566, lng: 2.3522,
    places: [
      { name: "Eyfel Kulesi", query: "Eiffel Tower Paris", category: "Tarihi Yerler" },
      { name: "Zafer Takı", query: "Arc de Triomphe Paris", category: "Tarihi Yerler" },
      { name: "Versay Sarayı", query: "Palace of Versailles", category: "Tarihi Yerler" },
      { name: "Louvre Müzesi", query: "Louvre Museum Paris", category: "Müzeler & Sanat" },
      { name: "Orsay Müzesi", query: "Musee d'Orsay Paris", category: "Müzeler & Sanat" },
      { name: "Notre-Dame Katedrali", query: "Notre-Dame Cathedral Paris", category: "Dini Yapılar" },
      { name: "Sacré-Cœur Bazilikası", query: "Sacre-Coeur Basilica Paris", category: "Dini Yapılar" },
      { name: "Champs-Élysées", query: "Champs Elysees Paris", category: "Meydanlar & Sokaklar" },
      { name: "Lüksemburg Bahçeleri", query: "Luxembourg Gardens Paris", category: "Parklar & Doğa" },
      { name: "Parc des Princes", query: "Parc des Princes Paris", category: "Stadyumlar" }
    ]
  },
  {
    name: "Roma", country: "İtalya", slug: "roma", query: "Rome landmark", lat: 41.9028, lng: 12.4964,
    places: [
      { name: "Kolezyum", query: "Colosseum Rome", category: "Tarihi Yerler" },
      { name: "Roma Forumu", query: "Roman Forum", category: "Tarihi Yerler" },
      { name: "Pantheon", query: "Pantheon Rome", category: "Tarihi Yerler" },
      { name: "Vatikan Müzeleri", query: "Vatican Museums", category: "Müzeler & Sanat" },
      { name: "Aziz Petrus Bazilikası", query: "St Peter's Basilica Vatican", category: "Dini Yapılar" },
      { name: "Trevi Çeşmesi", query: "Trevi Fountain Rome", category: "Meydanlar & Sokaklar" },
      { name: "İspanyol Merdivenleri", query: "Spanish Steps Rome", category: "Meydanlar & Sokaklar" },
      { name: "Villa Borghese", query: "Villa Borghese gardens Rome", category: "Parklar & Doğa" },
      { name: "Stadio Olimpico", query: "Stadio Olimpico Rome", category: "Stadyumlar" }
    ]
  },
  {
    name: "Barcelona", country: "İspanya", slug: "barcelona", query: "Barcelona landmark", lat: 41.3851, lng: 2.1734,
    places: [
      { name: "Casa Batlló", query: "Casa Batllo Barcelona", category: "Tarihi Yerler" },
      { name: "Casa Milà", query: "Casa Mila La Pedrera Barcelona", category: "Tarihi Yerler" },
      { name: "Picasso Müzesi", query: "Picasso Museum Barcelona", category: "Müzeler & Sanat" },
      { name: "Sagrada Familia", query: "Sagrada Familia Barcelona", category: "Dini Yapılar" },
      { name: "Gotik Mahalle", query: "Barri Gotic Gothic Quarter Barcelona", category: "Meydanlar & Sokaklar" },
      { name: "La Rambla", query: "La Rambla Barcelona", category: "Meydanlar & Sokaklar" },
      { name: "Park Güell", query: "Park Guell Barcelona", category: "Parklar & Doğa" },
      { name: "Camp Nou Stadyumu", query: "Camp Nou stadium Barcelona", category: "Stadyumlar" }
    ]
  },
  {
    name: "Amsterdam", country: "Hollanda", slug: "amsterdam", query: "Amsterdam landmark", lat: 52.3676, lng: 4.9041,
    places: [
      { name: "Anne Frank Evi", query: "Anne Frank House Amsterdam", category: "Tarihi Yerler" },
      { name: "Van Gogh Müzesi", query: "Van Gogh Museum Amsterdam", category: "Müzeler & Sanat" },
      { name: "Rijksmuseum", query: "Rijksmuseum Amsterdam", category: "Müzeler & Sanat" },
      { name: "Eski Kilise", query: "Oude Kerk Amsterdam", category: "Dini Yapılar" },
      { name: "Dam Meydanı", query: "Dam Square Amsterdam", category: "Meydanlar & Sokaklar" },
      { name: "Amsterdam Kanalları", query: "Amsterdam canals", category: "Parklar & Doğa" },
      { name: "Vondelpark", query: "Vondelpark Amsterdam", category: "Parklar & Doğa" },
      { name: "Heineken Deneyimi", query: "Heineken Experience Amsterdam", category: "Modern & Eğlence" },
      { name: "Johan Cruyff Arena", query: "Johan Cruyff Arena Amsterdam", category: "Stadyumlar" }
    ]
  },
  {
    name: "Prag", country: "Çekya", slug: "prag", query: "Prague landmark", lat: 50.0755, lng: 14.4378,
    places: [
      { name: "Prag Kalesi", query: "Prague Castle", category: "Tarihi Yerler" },
      { name: "Astronomik Saat", query: "Prague astronomical clock", category: "Tarihi Yerler" },
      { name: "Yahudi Mahallesi", query: "Josefov Jewish Quarter Prague", category: "Tarihi Yerler" },
      { name: "Aziz Vitus Katedrali", query: "St Vitus Cathedral Prague", category: "Dini Yapılar" },
      { name: "Strahov Manastırı", query: "Strahov Monastery Prague", category: "Dini Yapılar" },
      { name: "Karlov Köprüsü", query: "Charles Bridge Prague", category: "Meydanlar & Sokaklar" },
      { name: "Eski Şehir Meydanı", query: "Old Town Square Prague", category: "Meydanlar & Sokaklar" },
      { name: "Petřín Tepesi", query: "Petrin hill Prague", category: "Parklar & Doğa" },
      { name: "Strahov Stadyumu", query: "Strahov Stadium Prague", category: "Stadyumlar" }
    ]
  },
  {
    name: "Venedik", country: "İtalya", slug: "venedik", query: "Venice landmark", lat: 45.4408, lng: 12.3155,
    places: [
      { name: "Doge Sarayı", query: "Doge's Palace Venice", category: "Tarihi Yerler" },
      { name: "Accademia Galerisi", query: "Gallerie dell'Accademia Venice", category: "Müzeler & Sanat" },
      { name: "San Marco Bazilikası", query: "St Mark's Basilica Venice", category: "Dini Yapılar" },
      { name: "San Marco Meydanı", query: "St Mark's Square Venice", category: "Meydanlar & Sokaklar" },
      { name: "Rialto Köprüsü", query: "Rialto Bridge Venice", category: "Meydanlar & Sokaklar" },
      { name: "Büyük Kanal", query: "Grand Canal Venice", category: "Parklar & Doğa" },
      { name: "Burano Adası", query: "Burano island Venice", category: "Parklar & Doğa" },
      { name: "Murano Adası", query: "Murano island Venice", category: "Parklar & Doğa" },
      { name: "Penzo Stadyumu", query: "Stadio Pierluigi Penzo Venice", category: "Stadyumlar" }
    ]
  },
  {
    name: "Viyana", country: "Avusturya", slug: "viyana", query: "Vienna landmark", lat: 48.2082, lng: 16.3738,
    places: [
      { name: "Schönbrunn Sarayı", query: "Schonbrunn Palace Vienna", category: "Tarihi Yerler" },
      { name: "Hofburg Sarayı", query: "Hofburg Palace Vienna", category: "Tarihi Yerler" },
      { name: "Belvedere Sarayı", query: "Belvedere Palace Vienna", category: "Müzeler & Sanat" },
      { name: "Kunsthistorisches Müzesi", query: "Kunsthistorisches Museum Vienna", category: "Müzeler & Sanat" },
      { name: "Aziz Stephan Katedrali", query: "St Stephen's Cathedral Vienna", category: "Dini Yapılar" },
      { name: "Stadtpark", query: "Stadtpark Vienna", category: "Parklar & Doğa" },
      { name: "Viyana Devlet Operası", query: "Vienna State Opera", category: "Modern & Eğlence" },
      { name: "Prater Lunaparkı", query: "Prater Vienna", category: "Modern & Eğlence" },
      { name: "Ernst Happel Stadyumu", query: "Ernst Happel Stadion Vienna", category: "Stadyumlar" }
    ]
  },
  {
    name: "İstanbul", country: "Türkiye", slug: "istanbul", query: "Istanbul landmark", lat: 41.0082, lng: 28.9784,
    places: [
      { name: "Topkapı Sarayı", query: "Topkapi Palace Istanbul", category: "Tarihi Yerler" },
      { name: "Yerebatan Sarnıcı", query: "Basilica Cistern Istanbul", category: "Tarihi Yerler" },
      { name: "Galata Kulesi", query: "Galata Tower Istanbul", category: "Tarihi Yerler" },
      { name: "Dolmabahçe Sarayı", query: "Dolmabahce Palace Istanbul", category: "Tarihi Yerler" },
      { name: "Ayasofya", query: "Hagia Sophia Istanbul", category: "Dini Yapılar" },
      { name: "Sultanahmet Camii", query: "Blue Mosque Istanbul", category: "Dini Yapılar" },
      { name: "Kapalıçarşı", query: "Grand Bazaar Istanbul", category: "Meydanlar & Sokaklar" },
      { name: "Boğaziçi", query: "Bosphorus Istanbul", category: "Parklar & Doğa" },
      { name: "Atatürk Olimpiyat Stadı", query: "Ataturk Olympic Stadium Istanbul", category: "Stadyumlar" }
    ]
  },
  {
    name: "Lizbon", country: "Portekiz", slug: "lizbon", query: "Lisbon landmark", lat: 38.7223, lng: -9.1393,
    places: [
      { name: "Belém Kulesi", query: "Belem Tower Lisbon", category: "Tarihi Yerler" },
      { name: "São Jorge Kalesi", query: "Sao Jorge Castle Lisbon", category: "Tarihi Yerler" },
      { name: "Keşifler Anıtı", query: "Monument to the Discoveries Lisbon", category: "Tarihi Yerler" },
      { name: "Jerónimos Manastırı", query: "Jeronimos Monastery Lisbon", category: "Dini Yapılar" },
      { name: "Alfama Mahallesi", query: "Alfama Lisbon", category: "Meydanlar & Sokaklar" },
      { name: "Praça do Comércio", query: "Praca do Comercio Lisbon", category: "Meydanlar & Sokaklar" },
      { name: "Tarihi Tramvay 28", query: "Lisbon tram 28", category: "Modern & Eğlence" },
      { name: "LX Factory", query: "LX Factory Lisbon", category: "Modern & Eğlence" },
      { name: "Estádio da Luz", query: "Estadio da Luz Lisbon", category: "Stadyumlar" }
    ]
  },
  {
    name: "Budapeşte", country: "Macaristan", slug: "budapeste", query: "Budapest landmark", lat: 47.4979, lng: 19.0402,
    places: [
      { name: "Macar Parlamentosu", query: "Hungarian Parliament Building", category: "Tarihi Yerler" },
      { name: "Buda Kalesi", query: "Buda Castle Budapest", category: "Tarihi Yerler" },
      { name: "Balıkçı Tabyası", query: "Fisherman's Bastion Budapest", category: "Tarihi Yerler" },
      { name: "Vajdahunyad Kalesi", query: "Vajdahunyad Castle Budapest", category: "Tarihi Yerler" },
      { name: "Aziz Stephan Bazilikası", query: "St Stephen's Basilica Budapest", category: "Dini Yapılar" },
      { name: "Zincirli Köprü", query: "Chain Bridge Budapest", category: "Meydanlar & Sokaklar" },
      { name: "Margaret Adası", query: "Margaret Island Budapest", category: "Parklar & Doğa" },
      { name: "Széchenyi Kaplıcaları", query: "Szechenyi thermal bath Budapest", category: "Modern & Eğlence" },
      { name: "Puskás Aréna", query: "Puskas Arena Budapest", category: "Stadyumlar" }
    ]
  },
  {
    name: "Atina", country: "Yunanistan", slug: "atina", query: "Athens landmark", lat: 37.9838, lng: 23.7275,
    places: [
      { name: "Akropolis", query: "Acropolis Athens", category: "Tarihi Yerler" },
      { name: "Parthenon", query: "Parthenon Athens", category: "Tarihi Yerler" },
      { name: "Antik Agora", query: "Ancient Agora Athens", category: "Tarihi Yerler" },
      { name: "Akropolis Müzesi", query: "Acropolis Museum Athens", category: "Müzeler & Sanat" },
      { name: "Zeus Tapınağı", query: "Temple of Olympian Zeus Athens", category: "Dini Yapılar" },
      { name: "Plaka Mahallesi", query: "Plaka Athens", category: "Meydanlar & Sokaklar" },
      { name: "Likavitos Tepesi", query: "Lycabettus Hill Athens", category: "Parklar & Doğa" },
      { name: "Panathinaiko Stadyumu", query: "Panathenaic Stadium Athens", category: "Stadyumlar" }
    ]
  },
  {
    name: "Floransa", country: "İtalya", slug: "floransa", query: "Florence landmark", lat: 43.7696, lng: 11.2558,
    places: [
      { name: "Pitti Sarayı", query: "Pitti Palace Florence", category: "Tarihi Yerler" },
      { name: "Uffizi Galerisi", query: "Uffizi Gallery Florence", category: "Müzeler & Sanat" },
      { name: "Accademia (Davut)", query: "Galleria dell'Accademia Florence David", category: "Müzeler & Sanat" },
      { name: "Floransa Katedrali (Duomo)", query: "Florence Cathedral Duomo", category: "Dini Yapılar" },
      { name: "Ponte Vecchio", query: "Ponte Vecchio Florence", category: "Meydanlar & Sokaklar" },
      { name: "Piazza della Signoria", query: "Piazza della Signoria Florence", category: "Meydanlar & Sokaklar" },
      { name: "Boboli Bahçeleri", query: "Boboli Gardens Florence", category: "Parklar & Doğa" },
      { name: "Michelangelo Meydanı", query: "Piazzale Michelangelo Florence", category: "Parklar & Doğa" },
      { name: "Artemio Franchi Stadyumu", query: "Stadio Artemio Franchi Florence", category: "Stadyumlar" }
    ]
  },
  {
    name: "Berlin", country: "Almanya", slug: "berlin", query: "Berlin landmark", lat: 52.5200, lng: 13.4050,
    places: [
      { name: "Brandenburg Kapısı", query: "Brandenburg Gate Berlin", category: "Tarihi Yerler" },
      { name: "Reichstag Binası", query: "Reichstag building Berlin", category: "Tarihi Yerler" },
      { name: "Checkpoint Charlie", query: "Checkpoint Charlie Berlin", category: "Tarihi Yerler" },
      { name: "Berlin Duvarı (East Side)", query: "East Side Gallery Berlin Wall", category: "Tarihi Yerler" },
      { name: "Müze Adası", query: "Museum Island Berlin", category: "Müzeler & Sanat" },
      { name: "Pergamon Müzesi", query: "Pergamon Museum Berlin", category: "Müzeler & Sanat" },
      { name: "Berlin Katedrali", query: "Berlin Cathedral", category: "Dini Yapılar" },
      { name: "Tiergarten", query: "Tiergarten Berlin", category: "Parklar & Doğa" },
      { name: "Olimpiyat Stadyumu", query: "Olympiastadion Berlin", category: "Stadyumlar" }
    ]
  },
  {
    name: "Londra", country: "İngiltere", slug: "londra", query: "London landmark", lat: 51.5074, lng: -0.1278,
    places: [
      { name: "Big Ben", query: "Big Ben London", category: "Tarihi Yerler" },
      { name: "Londra Kulesi", query: "Tower of London", category: "Tarihi Yerler" },
      { name: "Buckingham Sarayı", query: "Buckingham Palace London", category: "Tarihi Yerler" },
      { name: "British Museum", query: "British Museum London", category: "Müzeler & Sanat" },
      { name: "Westminster Abbey", query: "Westminster Abbey London", category: "Dini Yapılar" },
      { name: "Tower Bridge", query: "Tower Bridge London", category: "Meydanlar & Sokaklar" },
      { name: "Hyde Park", query: "Hyde Park London", category: "Parklar & Doğa" },
      { name: "Londra Gözü", query: "London Eye", category: "Modern & Eğlence" },
      { name: "Wembley Stadyumu", query: "Wembley Stadium London", category: "Stadyumlar" }
    ]
  },
  {
    name: "Edinburgh", country: "İskoçya", slug: "edinburgh", query: "Edinburgh landmark", lat: 55.9533, lng: -3.1883,
    places: [
      { name: "Edinburgh Kalesi", query: "Edinburgh Castle", category: "Tarihi Yerler" },
      { name: "Holyrood Sarayı", query: "Holyrood Palace Edinburgh", category: "Tarihi Yerler" },
      { name: "İskoçya Ulusal Müzesi", query: "National Museum of Scotland Edinburgh", category: "Müzeler & Sanat" },
      { name: "Aziz Giles Katedrali", query: "St Giles Cathedral Edinburgh", category: "Dini Yapılar" },
      { name: "Royal Mile", query: "Royal Mile Edinburgh", category: "Meydanlar & Sokaklar" },
      { name: "Eski Şehir", query: "Edinburgh Old Town", category: "Meydanlar & Sokaklar" },
      { name: "Arthur's Seat", query: "Arthur's Seat Edinburgh", category: "Parklar & Doğa" },
      { name: "Calton Hill", query: "Calton Hill Edinburgh", category: "Parklar & Doğa" },
      { name: "Murrayfield Stadyumu", query: "Murrayfield Stadium Edinburgh", category: "Stadyumlar" }
    ]
  },
  {
    name: "Dubrovnik", country: "Hırvatistan", slug: "dubrovnik", query: "Dubrovnik landmark", lat: 42.6507, lng: 18.0944,
    places: [
      { name: "Dubrovnik Surları", query: "Dubrovnik city walls", category: "Tarihi Yerler" },
      { name: "Lovrijenac Kalesi", query: "Fort Lovrijenac Dubrovnik", category: "Tarihi Yerler" },
      { name: "Rektör Sarayı", query: "Rector's Palace Dubrovnik", category: "Müzeler & Sanat" },
      { name: "Fransiskan Manastırı", query: "Franciscan Monastery Dubrovnik", category: "Dini Yapılar" },
      { name: "Eski Şehir", query: "Dubrovnik old town", category: "Meydanlar & Sokaklar" },
      { name: "Stradun Caddesi", query: "Stradun street Dubrovnik", category: "Meydanlar & Sokaklar" },
      { name: "Lokrum Adası", query: "Lokrum island Dubrovnik", category: "Parklar & Doğa" },
      { name: "Srđ Dağı Teleferiği", query: "Dubrovnik cable car Mount Srd", category: "Modern & Eğlence" }
    ]
  },
  {
    name: "Salzburg", country: "Avusturya", slug: "salzburg", query: "Salzburg landmark", lat: 47.8095, lng: 13.0550,
    places: [
      { name: "Hohensalzburg Kalesi", query: "Hohensalzburg Fortress", category: "Tarihi Yerler" },
      { name: "Mirabell Sarayı", query: "Mirabell Palace Salzburg", category: "Tarihi Yerler" },
      { name: "Mozart'ın Doğduğu Ev", query: "Mozart Birthplace Salzburg", category: "Müzeler & Sanat" },
      { name: "Salzburg Katedrali", query: "Salzburg Cathedral", category: "Dini Yapılar" },
      { name: "Getreidegasse", query: "Getreidegasse Salzburg", category: "Meydanlar & Sokaklar" },
      { name: "Hellbrunn Sarayı", query: "Hellbrunn Palace Salzburg", category: "Parklar & Doğa" },
      { name: "Salzach Nehri", query: "Salzach river Salzburg", category: "Parklar & Doğa" },
      { name: "Kapuziner Tepesi", query: "Kapuzinerberg Salzburg", category: "Parklar & Doğa" },
      { name: "Red Bull Arena", query: "Red Bull Arena Salzburg", category: "Stadyumlar" }
    ]
  },
  {
    name: "Brugge", country: "Belçika", slug: "brugge", query: "Bruges landmark", lat: 51.2093, lng: 3.2247,
    places: [
      { name: "Belfry Kulesi", query: "Belfry of Bruges", category: "Tarihi Yerler" },
      { name: "Groeninge Müzesi", query: "Groeninge Museum Bruges", category: "Müzeler & Sanat" },
      { name: "Kutsal Kan Bazilikası", query: "Basilica of the Holy Blood Bruges", category: "Dini Yapılar" },
      { name: "Markt Meydanı", query: "Markt Square Bruges", category: "Meydanlar & Sokaklar" },
      { name: "Burg Meydanı", query: "Burg square Bruges", category: "Meydanlar & Sokaklar" },
      { name: "Brugge Kanalları", query: "Bruges canals", category: "Parklar & Doğa" },
      { name: "Begijnhof", query: "Begijnhof Bruges", category: "Parklar & Doğa" },
      { name: "Aşk Gölü", query: "Minnewater Lake Bruges", category: "Parklar & Doğa" },
      { name: "Jan Breydel Stadyumu", query: "Jan Breydel Stadium Bruges", category: "Stadyumlar" }
    ]
  },
  {
    name: "Madrid", country: "İspanya", slug: "madrid", query: "Madrid landmark", lat: 40.4168, lng: -3.7038,
    places: [
      { name: "Kraliyet Sarayı", query: "Royal Palace of Madrid", category: "Tarihi Yerler" },
      { name: "Prado Müzesi", query: "Prado Museum Madrid", category: "Müzeler & Sanat" },
      { name: "Reina Sofía Müzesi", query: "Reina Sofia Museum Madrid", category: "Müzeler & Sanat" },
      { name: "Almudena Katedrali", query: "Almudena Cathedral Madrid", category: "Dini Yapılar" },
      { name: "Plaza Mayor", query: "Plaza Mayor Madrid", category: "Meydanlar & Sokaklar" },
      { name: "Gran Vía", query: "Gran Via Madrid", category: "Meydanlar & Sokaklar" },
      { name: "Retiro Parkı", query: "Retiro Park Madrid", category: "Parklar & Doğa" },
      { name: "Santiago Bernabéu", query: "Santiago Bernabeu Stadium Madrid", category: "Stadyumlar" }
    ]
  },
  {
    name: "Münih", country: "Almanya", slug: "munih", query: "Munich landmark", lat: 48.1351, lng: 11.5820,
    places: [
      { name: "Nymphenburg Sarayı", query: "Nymphenburg Palace Munich", category: "Tarihi Yerler" },
      { name: "Deutsches Museum", query: "Deutsches Museum Munich", category: "Müzeler & Sanat" },
      { name: "Frauenkirche", query: "Frauenkirche Munich", category: "Dini Yapılar" },
      { name: "Marienplatz", query: "Marienplatz Munich", category: "Meydanlar & Sokaklar" },
      { name: "Viktualienmarkt", query: "Viktualienmarkt Munich", category: "Meydanlar & Sokaklar" },
      { name: "İngiliz Bahçesi", query: "English Garden Munich", category: "Parklar & Doğa" },
      { name: "BMW Müzesi", query: "BMW Museum Munich", category: "Modern & Eğlence" },
      { name: "Allianz Arena", query: "Allianz Arena Munich", category: "Stadyumlar" }
    ]
  },
  {
    name: "Milano", country: "İtalya", slug: "milano", query: "Milan landmark", lat: 45.4642, lng: 9.1900,
    places: [
      { name: "Sforza Kalesi", query: "Sforza Castle Milan", category: "Tarihi Yerler" },
      { name: "Brera Resim Galerisi", query: "Pinacoteca di Brera Milan", category: "Müzeler & Sanat" },
      { name: "Son Akşam Yemeği", query: "The Last Supper Santa Maria delle Grazie Milan", category: "Müzeler & Sanat" },
      { name: "Milano Katedrali", query: "Milan Cathedral Duomo", category: "Dini Yapılar" },
      { name: "Galleria Vittorio Emanuele II", query: "Galleria Vittorio Emanuele II Milan", category: "Meydanlar & Sokaklar" },
      { name: "Navigli", query: "Navigli Milan", category: "Meydanlar & Sokaklar" },
      { name: "Sempione Parkı", query: "Sempione Park Milan", category: "Parklar & Doğa" },
      { name: "La Scala", query: "La Scala Milan", category: "Modern & Eğlence" },
      { name: "San Siro Stadyumu", query: "San Siro Stadium Milan", category: "Stadyumlar" }
    ]
  },
  {
    name: "Napoli", country: "İtalya", slug: "napoli", query: "Naples landmark", lat: 40.8518, lng: 14.2681,
    places: [
      { name: "Yeni Kale", query: "Castel Nuovo Naples", category: "Tarihi Yerler" },
      { name: "Yumurta Kalesi", query: "Castel dell'Ovo Naples", category: "Tarihi Yerler" },
      { name: "Pompeii", query: "Pompeii ruins", category: "Tarihi Yerler" },
      { name: "Arkeoloji Müzesi", query: "Naples National Archaeological Museum", category: "Müzeler & Sanat" },
      { name: "Napoli Katedrali", query: "Naples Cathedral", category: "Dini Yapılar" },
      { name: "Spaccanapoli", query: "Spaccanapoli Naples", category: "Meydanlar & Sokaklar" },
      { name: "Plebiscito Meydanı", query: "Piazza del Plebiscito Naples", category: "Meydanlar & Sokaklar" },
      { name: "Vezüv Yanardağı", query: "Mount Vesuvius", category: "Parklar & Doğa" },
      { name: "Diego Maradona Stadyumu", query: "Stadio Diego Armando Maradona Naples", category: "Stadyumlar" }
    ]
  },
  {
    name: "Nice", country: "Fransa", slug: "nice", query: "Nice France landmark", lat: 43.7102, lng: 7.2620,
    places: [
      { name: "Matisse Müzesi", query: "Matisse Museum Nice", category: "Müzeler & Sanat" },
      { name: "Marc Chagall Müzesi", query: "Marc Chagall Museum Nice", category: "Müzeler & Sanat" },
      { name: "Sainte-Réparate Katedrali", query: "Sainte-Reparate Cathedral Nice", category: "Dini Yapılar" },
      { name: "Promenade des Anglais", query: "Promenade des Anglais Nice", category: "Meydanlar & Sokaklar" },
      { name: "Eski Nice", query: "Old Town Vieux Nice", category: "Meydanlar & Sokaklar" },
      { name: "Cours Saleya Pazarı", query: "Cours Saleya market Nice", category: "Meydanlar & Sokaklar" },
      { name: "Masséna Meydanı", query: "Place Massena Nice", category: "Meydanlar & Sokaklar" },
      { name: "Castle Tepesi", query: "Castle Hill Nice Colline du Chateau", category: "Parklar & Doğa" },
      { name: "Allianz Riviera", query: "Allianz Riviera Nice", category: "Stadyumlar" }
    ]
  },
  {
    name: "Brüksel", country: "Belçika", slug: "bruksel", query: "Brussels landmark", lat: 50.8503, lng: 4.3517,
    places: [
      { name: "Manneken Pis", query: "Manneken Pis Brussels", category: "Tarihi Yerler" },
      { name: "Kraliyet Sarayı", query: "Royal Palace of Brussels", category: "Tarihi Yerler" },
      { name: "Güzel Sanatlar Müzesi", query: "Royal Museums of Fine Arts Brussels", category: "Müzeler & Sanat" },
      { name: "Çizgi Roman Müzesi", query: "Belgian Comic Strip Center Brussels", category: "Müzeler & Sanat" },
      { name: "Aziz Mikail Katedrali", query: "St Michael Cathedral Brussels", category: "Dini Yapılar" },
      { name: "Grand Place", query: "Grand Place Brussels", category: "Meydanlar & Sokaklar" },
      { name: "Cinquantenaire Parkı", query: "Cinquantenaire Park Brussels", category: "Parklar & Doğa" },
      { name: "Atomium", query: "Atomium Brussels", category: "Modern & Eğlence" },
      { name: "Kral Baudouin Stadyumu", query: "King Baudouin Stadium Brussels", category: "Stadyumlar" }
    ]
  },
  {
    name: "Kopenhag", country: "Danimarka", slug: "kopenhag", query: "Copenhagen landmark", lat: 55.6761, lng: 12.5683,
    places: [
      { name: "Küçük Deniz Kızı", query: "Little Mermaid Copenhagen", category: "Tarihi Yerler" },
      { name: "Rosenborg Kalesi", query: "Rosenborg Castle Copenhagen", category: "Tarihi Yerler" },
      { name: "Amalienborg Sarayı", query: "Amalienborg Palace Copenhagen", category: "Tarihi Yerler" },
      { name: "Ny Carlsberg Glyptotek", query: "Ny Carlsberg Glyptotek Copenhagen", category: "Müzeler & Sanat" },
      { name: "Frederik Kilisesi", query: "Frederik's Church Copenhagen", category: "Dini Yapılar" },
      { name: "Nyhavn", query: "Nyhavn Copenhagen", category: "Meydanlar & Sokaklar" },
      { name: "Christiansborg Sarayı", query: "Christiansborg Palace Copenhagen", category: "Meydanlar & Sokaklar" },
      { name: "Tivoli Bahçeleri", query: "Tivoli Gardens Copenhagen", category: "Modern & Eğlence" },
      { name: "Parken Stadyumu", query: "Parken Stadium Copenhagen", category: "Stadyumlar" }
    ]
  },
  {
    name: "Stockholm", country: "İsveç", slug: "stockholm", query: "Stockholm landmark", lat: 59.3293, lng: 18.0686,
    places: [
      { name: "Kraliyet Sarayı", query: "Royal Palace Stockholm", category: "Tarihi Yerler" },
      { name: "Stockholm Belediye Binası", query: "Stockholm City Hall", category: "Tarihi Yerler" },
      { name: "Vasa Müzesi", query: "Vasa Museum Stockholm", category: "Müzeler & Sanat" },
      { name: "ABBA Müzesi", query: "ABBA Museum Stockholm", category: "Müzeler & Sanat" },
      { name: "Storkyrkan", query: "Storkyrkan Stockholm Cathedral", category: "Dini Yapılar" },
      { name: "Gamla Stan", query: "Gamla Stan Stockholm", category: "Meydanlar & Sokaklar" },
      { name: "Djurgården", query: "Djurgarden Stockholm", category: "Parklar & Doğa" },
      { name: "Skansen", query: "Skansen Stockholm", category: "Modern & Eğlence" },
      { name: "Friends Arena", query: "Friends Arena Stockholm", category: "Stadyumlar" }
    ]
  },
  {
    name: "Varşova", country: "Polonya", slug: "varsova", query: "Warsaw landmark", lat: 52.2297, lng: 21.0122,
    places: [
      { name: "Kraliyet Kalesi", query: "Royal Castle Warsaw", category: "Tarihi Yerler" },
      { name: "Wilanów Sarayı", query: "Wilanow Palace Warsaw", category: "Tarihi Yerler" },
      { name: "POLIN Müzesi", query: "POLIN Museum Warsaw", category: "Müzeler & Sanat" },
      { name: "Aziz Yuhanna Katedrali", query: "St John's Archcathedral Warsaw", category: "Dini Yapılar" },
      { name: "Eski Şehir Meydanı", query: "Old Town Market Square Warsaw", category: "Meydanlar & Sokaklar" },
      { name: "Kraliyet Yolu", query: "Krakowskie Przedmiescie Warsaw", category: "Meydanlar & Sokaklar" },
      { name: "Łazienki Parkı", query: "Lazienki Park Warsaw", category: "Parklar & Doğa" },
      { name: "Kültür ve Bilim Sarayı", query: "Palace of Culture and Science Warsaw", category: "Modern & Eğlence" },
      { name: "Ulusal Stadyum (PGE Narodowy)", query: "PGE Narodowy National Stadium Warsaw", category: "Stadyumlar" }
    ]
  },
  {
    name: "Krakov", country: "Polonya", slug: "krakov", query: "Krakow landmark", lat: 50.0647, lng: 19.9450,
    places: [
      { name: "Wawel Kalesi", query: "Wawel Castle Krakow", category: "Tarihi Yerler" },
      { name: "Kazimierz (Yahudi Mahallesi)", query: "Kazimierz Krakow", category: "Tarihi Yerler" },
      { name: "Czartoryski Müzesi", query: "Czartoryski Museum Krakow", category: "Müzeler & Sanat" },
      { name: "Aziz Meryem Bazilikası", query: "St Mary's Basilica Krakow", category: "Dini Yapılar" },
      { name: "Wawel Katedrali", query: "Wawel Cathedral Krakow", category: "Dini Yapılar" },
      { name: "Ana Meydan", query: "Main Market Square Krakow", category: "Meydanlar & Sokaklar" },
      { name: "Sukiennice (Kumaş Salonu)", query: "Cloth Hall Sukiennice Krakow", category: "Meydanlar & Sokaklar" },
      { name: "Planty Parkı", query: "Planty Park Krakow", category: "Parklar & Doğa" },
      { name: "Cracovia Stadyumu", query: "Stadion Cracovii Krakow", category: "Stadyumlar" }
    ]
  },
  {
    name: "Dublin", country: "İrlanda", slug: "dublin", query: "Dublin landmark", lat: 53.3498, lng: -6.2603,
    places: [
      { name: "Trinity College", query: "Trinity College Dublin", category: "Tarihi Yerler" },
      { name: "Dublin Kalesi", query: "Dublin Castle", category: "Tarihi Yerler" },
      { name: "İrlanda Ulusal Müzesi", query: "National Museum of Ireland Dublin", category: "Müzeler & Sanat" },
      { name: "Aziz Patrick Katedrali", query: "St Patrick's Cathedral Dublin", category: "Dini Yapılar" },
      { name: "Temple Bar", query: "Temple Bar Dublin", category: "Meydanlar & Sokaklar" },
      { name: "Ha'penny Köprüsü", query: "Ha'penny Bridge Dublin", category: "Meydanlar & Sokaklar" },
      { name: "Phoenix Parkı", query: "Phoenix Park Dublin", category: "Parklar & Doğa" },
      { name: "Guinness Deposu", query: "Guinness Storehouse Dublin", category: "Modern & Eğlence" },
      { name: "Aviva Stadyumu", query: "Aviva Stadium Dublin", category: "Stadyumlar" }
    ]
  },
  {
    name: "Zürih", country: "İsviçre", slug: "zurih", query: "Zurich landmark", lat: 47.3769, lng: 8.5417,
    places: [
      { name: "İsviçre Ulusal Müzesi", query: "Swiss National Museum Zurich", category: "Müzeler & Sanat" },
      { name: "Kunsthaus Zürih", query: "Kunsthaus Zurich", category: "Müzeler & Sanat" },
      { name: "Grossmünster", query: "Grossmunster Zurich", category: "Dini Yapılar" },
      { name: "Fraumünster", query: "Fraumunster Zurich", category: "Dini Yapılar" },
      { name: "Eski Şehir (Altstadt)", query: "Zurich Old Town Altstadt", category: "Meydanlar & Sokaklar" },
      { name: "Bahnhofstrasse", query: "Bahnhofstrasse Zurich", category: "Meydanlar & Sokaklar" },
      { name: "Zürih Gölü", query: "Lake Zurich", category: "Parklar & Doğa" },
      { name: "Lindenhof", query: "Lindenhof Zurich", category: "Parklar & Doğa" },
      { name: "Letzigrund Stadyumu", query: "Letzigrund Stadium Zurich", category: "Stadyumlar" }
    ]
  },
  {
    name: "Moskova", country: "Rusya", slug: "moskova", query: "Moscow landmark", lat: 55.7558, lng: 37.6173,
    places: [
      { name: "Kremlin", query: "Moscow Kremlin", category: "Tarihi Yerler" },
      { name: "Aziz Vasil Katedrali", query: "Saint Basil's Cathedral Moscow", category: "Dini Yapılar" },
      { name: "Kurtarıcı İsa Katedrali", query: "Cathedral of Christ the Saviour Moscow", category: "Dini Yapılar" },
      { name: "Tretyakov Galerisi", query: "Tretyakov Gallery Moscow", category: "Müzeler & Sanat" },
      { name: "Kızıl Meydan", query: "Red Square Moscow", category: "Meydanlar & Sokaklar" },
      { name: "GUM Pasajı", query: "GUM department store Moscow", category: "Meydanlar & Sokaklar" },
      { name: "Gorki Parkı", query: "Gorky Park Moscow", category: "Parklar & Doğa" },
      { name: "Bolşoy Tiyatrosu", query: "Bolshoi Theatre Moscow", category: "Modern & Eğlence" },
      { name: "Lujniki Stadyumu", query: "Luzhniki Stadium Moscow", category: "Stadyumlar" }
    ]
  },
  {
    name: "Sankt-Petersburg", country: "Rusya", slug: "petersburg", query: "Saint Petersburg landmark", lat: 59.9311, lng: 30.3609,
    places: [
      { name: "Kışlık Saray", query: "Winter Palace Saint Petersburg", category: "Tarihi Yerler" },
      { name: "Peter ve Paul Kalesi", query: "Peter and Paul Fortress Saint Petersburg", category: "Tarihi Yerler" },
      { name: "Ermitaj Müzesi", query: "Hermitage Museum Saint Petersburg", category: "Müzeler & Sanat" },
      { name: "Kanlı Kilise", query: "Church of the Savior on Blood Saint Petersburg", category: "Dini Yapılar" },
      { name: "Aziz Isaac Katedrali", query: "Saint Isaac's Cathedral Saint Petersburg", category: "Dini Yapılar" },
      { name: "Nevsky Bulvarı", query: "Nevsky Prospect Saint Petersburg", category: "Meydanlar & Sokaklar" },
      { name: "Peterhof Sarayı", query: "Peterhof Palace", category: "Parklar & Doğa" },
      { name: "Mariinsky Tiyatrosu", query: "Mariinsky Theatre Saint Petersburg", category: "Modern & Eğlence" },
      { name: "Gazprom Arena", query: "Gazprom Arena Krestovsky Saint Petersburg", category: "Stadyumlar" }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CITIES };
}
