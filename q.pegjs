{
const slang = require('slang');
}

start
 = s:sentence { return s; }

sentence
  = space* f:question space* "?" space* { return f; }

question
 = f:can { return f; }

can
 = "can" space subject:word space verb:word space object:word { return { type: 'can', subject, verb, object }; }

space
 = [ \t\r\n]+

word "word"
 = text:[0-9A-Za-z_-]+ { return slang.singularize(text.join('').toLowerCase()); }
