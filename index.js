'use strict';

const fs = require('fs');
const path = require('path');
const peg = require("pegjs");

const kb_grammar = fs.readFileSync(path.join(__dirname, 'kb.pegjs')).toString();
const kb_parser = peg.generate(kb_grammar);
const q_grammar = fs.readFileSync(path.join(__dirname, 'q.pegjs')).toString();
const q_parser = peg.generate(q_grammar);

class KnoweldgeBase {

    constructor(text = '') {
        this.facts = kb_parser.parse(text).reduce((kb, fact) => {
            switch (fact.type) {
                case 'is_a':
                    if (!kb.is_a.hasOwnProperty(fact.subject)) {
                        kb.is_a[fact.subject] = [];
                    }
                    kb.is_a[fact.subject].push(fact.object);
                    break;
                case 'can':
                    if (!kb.can.hasOwnProperty(fact.subject)) {
                        kb.can[fact.subject] = {}
                    }
                    if (!kb.can[fact.subject].hasOwnProperty(fact.object)) {
                        kb.can[fact.subject][fact.object] = [];
                    }
                    kb.can[fact.subject][fact.object].push(fact.verb);
                    break;
            }
            return  kb;
        }, { 'is_a': {}, 'can': {}});
    }

    getSubject(subject) {
        return this.facts.is_a.hasOwnProperty(subject) ? this.facts.is_a[subject] : null;
    }

    query(text = '') {
        const is_a = new Set();
        const q = q_parser.parse(text);

        if (this.getSubject(q.subject) === null) {
            return false;
        }

        switch (q.type) {
            case 'can':

                // recursively ixpand this.facts.is_a
                // x is a y, y is a z -> [ x, y, z ]

                const next = [ q.subject ];

                while (next.length > 0) {
                    const object = next.shift();
                    if (!is_a.has(object)) {
                        is_a.add(object);
                        const potentialObjects = this.getSubject(object);
                        if (potentialObjects !== null) {
                            potentialObjects.forEach((potentialObject) => next.push(potentialObject));
                        }
                    }
                }

                // search can for our subject and any infered subjects
                // referencing the object with the verb
                for (const subject of is_a) {
                    if (this.facts.can.hasOwnProperty(subject)
                            && this.facts.can[subject].hasOwnProperty(q.object)
                            && this.facts.can[subject][q.object].includes(q.verb)) {
                        return true;
                    }
                }
                break;
            default:
                break;
        }

        return false;
    }
}

const kb = new KnoweldgeBase(`
    admins can remove comments.
    moderators can hide comments.
    users can view comments.

    moderators are users.
    admins are moderators.

    tcort is an admin.
    alice is a moderator.
    bob is a user.
`);

console.log(kb.query('can tcort hide comments?'));
console.log(kb.query('can alice remove comments?'));
console.log(kb.query('can tcort remove comments?'));
console.log(kb.query('can bob hide comments?'));
console.log(kb.query('can tcort view comments?'));
