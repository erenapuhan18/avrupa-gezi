// Her ülke için pratik gezi bilgileri (para birimi, dil, en iyi mevsim, priz).
// Şehir sayfasındaki "Gezi Rehberi" kartında gösterilir. Anahtarlar cities.js'teki
// ülke adlarıyla birebir aynı olmalı.
const COUNTRY_GUIDE = {
  "Fransa":      { currency: "Euro (€)",            language: "Fransızca",                 season: "Nisan–Haziran, Eylül–Ekim", plug: "C / E tipi" },
  "İtalya":      { currency: "Euro (€)",            language: "İtalyanca",                 season: "Nisan–Haziran, Eylül–Ekim", plug: "C / F / L tipi" },
  "İspanya":     { currency: "Euro (€)",            language: "İspanyolca",                season: "Mart–Mayıs, Eylül–Ekim",    plug: "C / F tipi" },
  "Hollanda":    { currency: "Euro (€)",            language: "Felemenkçe",                season: "Nisan–Eylül (lale: Nis–May)", plug: "C / F tipi" },
  "Çekya":       { currency: "Çek Korunası (Kč)",   language: "Çekçe",                     season: "Mayıs–Eylül",               plug: "C / E tipi" },
  "Avusturya":   { currency: "Euro (€)",            language: "Almanca",                   season: "Mayıs–Eylül (kayak: Ara–Mar)", plug: "C / F tipi" },
  "Türkiye":     { currency: "Türk Lirası (₺)",     language: "Türkçe",                    season: "Nisan–Haziran, Eylül–Kasım", plug: "C / F tipi" },
  "Portekiz":    { currency: "Euro (€)",            language: "Portekizce",                season: "Mart–Haziran, Eylül–Ekim",  plug: "C / F tipi" },
  "Macaristan":  { currency: "Forint (Ft)",         language: "Macarca",                   season: "Nisan–Haziran, Eylül–Ekim", plug: "C / F tipi" },
  "Yunanistan":  { currency: "Euro (€)",            language: "Yunanca",                   season: "Mayıs–Haziran, Eylül–Ekim", plug: "C / F tipi" },
  "Almanya":     { currency: "Euro (€)",            language: "Almanca",                   season: "Mayıs–Eylül",               plug: "C / F tipi" },
  "İngiltere":   { currency: "Sterlin (£)",         language: "İngilizce",                 season: "Mayıs–Eylül",               plug: "G tipi" },
  "İskoçya":     { currency: "Sterlin (£)",         language: "İngilizce",                 season: "Mayıs–Eylül",               plug: "G tipi" },
  "Hırvatistan": { currency: "Euro (€)",            language: "Hırvatça",                  season: "Mayıs–Haziran, Eylül",      plug: "C / F tipi" },
  "Belçika":     { currency: "Euro (€)",            language: "Felemenkçe / Fransızca",    season: "Nisan–Eylül",               plug: "C / E tipi" },
  "Danimarka":   { currency: "Danimarka Kronu (kr)", language: "Danca",                    season: "Mayıs–Ağustos",             plug: "C / K tipi" },
  "İsveç":       { currency: "İsveç Kronu (kr)",    language: "İsveççe",                   season: "Mayıs–Eylül",               plug: "C / F tipi" },
  "Polonya":     { currency: "Zloti (zł)",          language: "Lehçe",                     season: "Mayıs–Eylül",               plug: "C / E tipi" },
  "İrlanda":     { currency: "Euro (€)",            language: "İngilizce / İrlandaca",     season: "Mayıs–Eylül",               plug: "G tipi" },
  "İsviçre":     { currency: "İsviçre Frangı (CHF)", language: "Almanca / Fransızca / İt.", season: "Haziran–Eylül (kayak: Ara–Mar)", plug: "C / J tipi" },
  "Rusya":       { currency: "Rus Rublesi (₽)",     language: "Rusça",                     season: "Mayıs–Eylül",               plug: "C / F tipi" }
};
