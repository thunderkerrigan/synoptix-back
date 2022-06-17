// regexp
export const FULL_REG_EXP = /(\\n)|(<\/?.?>)|([\p{L}]+)|([\p{N}]+)|(.+?)/gu
export const HTML_TAGS_REG_EXP = /<\/?.?>/gu
// export const FULL_REG_EXP = /([\p{Letter}]+)|([\p{Number}]+)|(.+?)/gu;
export const WORDS_REG_EXP = /(?:<\/?p>)|([\p{L}]+)|([\p{N}]+)/gu
export const HTML_LINK_CONTENT_REG_EXP = /(<a href=.+?>)|(<\/a>)/g
export const SPACING_REG_EXP = /(&#160;)/g
export const UNWANTED_HTML_CONTENT_REG_EXP =
    /(<\/?span( .+?)?>)|(<div .+?>(.|\n)+?<\/div>)|(<sup .+?>(.|\n)+?<\/sup>)/g
export const PARAGRAPHS_REG_EXP = /(<p>(.+)\s<\/p>)/gmu
