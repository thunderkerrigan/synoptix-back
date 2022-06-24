export const LEMATIZE_WORD_QUERY = (word: string) => `SELECT ?l WHERE {
     VALUES ?word {
       "${word}"@fr
     }
     ?l rdf:type ontolex:LexicalEntry;
       dct:language wd:Q150;
       wikibase:lemma ?lemma;
       ontolex:lexicalForm ?form.
     ?form ontolex:representation ?word.
   }`;

export const ALL_FORMS_WORD_QUERY = (lexeme: string) => `
   # List of forms for a specific lexeme
   SELECT
  #  ?form 
  ?formLabel
    # (GROUP_CONCAT(DISTINCT ?featureLabel; separator=" // ") AS ?features)
    # (GROUP_CONCAT(DISTINCT ?hyphenation; separator=" // ") AS ?hyphenations)
   WHERE {
     wd:${lexeme} ontolex:lexicalForm ?form .
     ?form ontolex:representation ?formLabel .
     OPTIONAL {
       ?form wikibase:grammaticalFeature ?feature .
       ?feature rdfs:label ?featureLabel .
       FILTER (LANG(?featureLabel) = "en")
     }
     OPTIONAL {
      ?form wdt:P5279 ?hyphenation
     }
   }
   GROUP BY ?form ?formLabel
   ORDER BY (STR(?form))
 `;

export const ALL_CONJUGATION_WORD_QUERY = (lexeme: string) => `
SELECT
#?form
?formLabel 
#(GROUP_CONCAT(DISTINCT ?featureLabel; SEPARATOR = " // ") AS ?features) 
#(GROUP_CONCAT(DISTINCT ?hyphenation; SEPARATOR = " // ") AS ?hyphenations)
WHERE {
  wd:${lexeme} ontolex:lexicalForm ?form.
  ?form ontolex:representation ?formLabel.
  OPTIONAL {
    ?form wikibase:grammaticalFeature ?feature.
    ?feature rdfs:label ?featureLabel.
    FILTER((LANG(?featureLabel)) = "en")
  }
  OPTIONAL { ?form wdt:P5279 ?hyphenation. }
}
GROUP BY ?form ?formLabel
ORDER BY (STR(?form))
 `;
