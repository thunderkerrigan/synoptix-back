// regexp
export const FULL_REG_EXP = /(\\n)|(<\/?.?>)|([\p{L}]+)|([\p{N}]+)|(.+?)/gu;
export const HTML_TAGS_REG_EXP = /<\/?.?>/gu;
// export const FULL_REG_EXP = /([\p{Letter}]+)|([\p{Number}]+)|(.+?)/gu;
export const WORDS_REG_EXP = /(?:<\/?p>)|([\p{L}]+)|([\p{N}]+)/gu;
export const HTML_LINK_CONTENT_REG_EXP = /(<a href=.+?>)|(<\/a>)/g;
export const SPACING_REG_EXP = /(&#160;)|<br \/>/g;
export const UNWANTED_HTML_CONTENT_REG_EXP =
  /(<\/?span( .+?)?>)|(<div .+?>(.|\n)+?<\/div>)|(<sup .+?>(.|\n)+?<\/sup>)/g;
export const UNWANTED_TITLE_WORDS_REG_EXP = /(\(film(?:.)*\))/gu;
export const PARAGRAPHS_REG_EXP =
  /(<p>(?:(?!.*error mw-ext-cite-error).+\s)+?<\/p>)/gmu;

export const TABLE_MFSP_REG_EXP = /(?:\|)(ms|fs|fp|mp)(?:=)(.*)/gu;

export const REF_REG_EXP = /(\n?<ref(?:.*?)??>.+<\/ref>\n?)/gmu;
export const SMALL_NOTE_REG_EXP = /(\n?<small>Note.+<\/small>\n?)/gmu;
export const WIKI_HEADER_REG_EXP = /(={2,3} .+ ={2,3}\n)/gu;
export const WIKI_TEXT_REG_EXP = /(?:\[\[)(.+?)(?:\]\])/gu;
export const WIKI_LANGUAGE_REG_EXP = /(?:\{\{langue\|)(?:.+?\|)(.*?)(?:\}\})/gu;
export const WIKI_COMMA_REG_EXP = /(?:\{\{)(,)(?:\}\})/gu;
export const WIKI_UNITE_REG_EXP = /(?:\{\{unité\|)(.*)(?:\}\})/giu;
export const WIKI_DATE_REG_EXP = /(?:\{\{date\|)(.*?)(?:\}\})/gu;
export const WIKI_OTHER_REG_EXP = /(?:\{\{)(.*?)(?:\}\})/gu;
export const WIKI_FILE_REG_EXP = /\n(\[\[Fichier:.+?\]\]\n)/gu;
// (?:\[\[)(?:(?:.*?\|)??)?(.*?)(?:\]\])
