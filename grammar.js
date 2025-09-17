

const clingo = require('tree-sitter-clingo/grammar');

module.exports = grammar(clingo, {
    name: 'fasp',

    externals: $ => [
        ":-",
        ":",
    ],
    
    rules: {
        aggregate_assignment_aggregate: $ => seq($.aggregate_function, "{", optional($.body_aggregate_elements), "}"),
        choice_assignment_aggregate: $ => seq("{", $.body_aggregate_elements, "}"),

        simple_assignment: $ => seq($.term, ":=", $.term),
        aggregate_assignment: $ => seq($.term, ":=", $.aggregate_assignment_aggregate),
        choice_assignment: $ => seq($.term, "in", $.choice_assignment_aggregate),

        _head_assignment: $ => choice($.simple_assignment, $.aggregate_assignment, $.choice_assignment),

        assignment_rule: $ => seq($._head_assignment, choice(".", seq(":-", $.body))),
    }
});
