const clingo = require('tree-sitter-clingo/grammar');

module.exports = grammar(clingo, {
    name: 'fasp',

    externals: $ => [
        ":-",
        ":=",
        ":",
    ],
    
    rules: {
        simple_assignment: $ => seq($.term, ":=", $.term),       

        _aggregate_assignment: $ => seq($.aggregate_function, "{", optional($.body_aggregate_elements), "}"),
        aggregate_assignment: $ => seq($.term, ":=", $._aggregate_assignment),

        _choice_some_assignment: $ => seq("{", $.body_aggregate_elements, "}"),
        choice_some_assignment: $ => seq($.term, "#some", $._choice_some_assignment),

        choice_assignment_element: $ => seq(
            field("assignment", $.simple_assignment),
            field("condition", optional($._condition))),
        choice_assignment_elements: $ => seq($.choice_assignment_element, repeat(seq(";", $.choice_assignment_element))),
        _choice_assignment: $ => seq("{", $.choice_assignment_elements, "}"),
        choice_assignment: $ => seq(optional($.lower), $._choice_assignment, optional($.upper)),

        _head_assignment: $ => choice($.simple_assignment, $.aggregate_assignment, $.choice_some_assignment, $.choice_assignment),

        assignment_rule: $ => seq($._head_assignment, choice(".", seq(":-", $.body))),

        statement: ($, original) => choice(
            $.assignment_rule,
            ...original.members,
        ),
    }
});
