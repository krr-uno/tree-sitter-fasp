const clingo = require('tree-sitter-clingo/grammar');

module.exports = grammar(clingo, {
    name: 'fasp',

    externals: $ => [$.empty_pool_item_first, $.empty_pool_item, $.colon],
    
    rules: {
        simple_assignment: $ => seq($.function, ":=", $.term),       

        aggregate_assignment_aggregate: $ => seq($.aggregate_function, "{", optional($.body_aggregate_elements), "}"),
        aggregate_assignment: $ => seq($.function, ":=", $.aggregate_assignment_aggregate),

        _choice_some_assignment: $ => seq("{", $.body_aggregate_elements, "}"),
        choice_some_assignment: $ => seq($.term, "#some", $._choice_some_assignment),

        choice_assignment_element: $ => seq(
            field("assignment", $.simple_assignment),
            field("condition", optional($._condition))
        ),
        // This precedence is needed to avoid conflicts with set_aggregate_element in the clingo grammar
        // If no assignment is present, we prefer a regular clingo choice;
        // only when at least one assignment is present, we consider it a choice assignment
        _choice_assignment_element : $ => prec(-1,choice(
            $.choice_assignment_element,
            $.set_aggregate_element
        )),
        choice_assignment_elements: $ => seq($._choice_assignment_element, repeat(seq(";", $._choice_assignment_element))),
        choice_assignment: $ => seq(
            optional(field("left", $.lower)), 
            "{", 
            // The elements field is not optional here. If no elements are present, it should be parsed as an empty clingo choice
            field("elements", $.choice_assignment_elements),
            "}", 
            optional(field("right", $.upper))
        ),

        _head_assignment: $ => choice($.simple_assignment, $.aggregate_assignment, $.choice_some_assignment, $.choice_assignment),

        assignment_rule: $ => 
            seq(
                field("head", $._head_assignment), 
                optional(seq(":-", field("body", $.body))), 
                ".",
            ),

        statement: ($, original) => choice(
            $.assignment_rule,
            ...original.members,
        ),
    }
});
