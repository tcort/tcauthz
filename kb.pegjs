{
const slang = require('slang');
}

start
 = s:sentence+ { return s; }

sentence
  = space* f:fact space* "." space* { return f; }

fact
 = f:is_a { return f; }
 / f:has_a { return f; }
 / f:can { return f; }

can
 = subject:word space "can" space verb:word space object:word { return { type: 'can', subject, verb, object }; }

is_a
 = subject:word space "is" space "a" space object:word { return { type: 'is_a', subject, object }; }
 / subject:word space "is" space "an" space object:word { return { type: 'is_a', subject, object }; }
 / subject:word space "are" space object:word { return { type: 'is_a', subject, object }; }

has_a
 = subject:word space "has" space "a" space object:word { return { type: 'has_a', subject, object }; }
 / subject:word space "has" space "an" space object:word { return { type: 'has_a', subject, object }; }

space
 = [ \t\r\n]+

word "word"
 = text:[0-9A-Za-z_-]+ { return slang.singularize(text.join('').toLowerCase()); }
