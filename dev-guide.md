The Project
==================================================
Aims
--------------------------------------------------
The project aims at developing a handy tool for devlopers
to create a class diagram (UML). GUI is always a fancy way
for ordinary users to utilize an information system.
However, syntax and text input is a much handy way for
developers to quickly finish their tasks.

Inspired by an [online sequence diagram tool](https://sequencediagram.org),
it is proposed to create a system that resembles its
input and generates a class diagram.

Methodology / Tools
--------------------------------------------------------
- [Agile](https://agilemanifesto.org/authors.html) development
- Scrum, biweekly sprint
- CI/CD
- [Slack](https://slack.com/intl/en-hk/): Communication tool
- [Jasmine](https://jasmine.github.io/): automated test script / TDD
- UML

Project Scope
--------------------------------------------------------
Project scope statement:
```
Develop a basic online text-to-class-diagram tool for quick
documentation of software project within 10 weeks.
```

Project Time
--------------------------------------------------------
Biweekly sprints


Project Resources
--------------------------------------------------------
VM, 7 developers

Risks
--------------------------------------------------------



<a name="WBS"></a>
Work breakdown Structure
==================================================
1. Text parser Design
    1. Design syntax
        1. `[#TT-01]` Design object type identifier
        1. `[#TT-02]` Design attribute identifier
        1. `[#TT-03]` Design method identifier
        1. `[#TT-04]` Type identifier
        1. `[#TT-05]` Design association identifier
    1. `[#TT-06]` Create test cases
    1. `[#TT-07]` Implement Unit test scripts
    1. `[#TT-08]` Design tokenizing flow
    1. Implement tokenizer
        1. `[#TT-09]` Implement object type identifier
        1. `[#TT-10]` Implement attribute identifier
        1. `[#TT-11]` Implement method identifier
        1. `[#TT-12]` Implement association identifier
1. Drawing diagram
    1. `[#TD-01]` Design test cases
    1. `[#TD-02]` Design box-location assignment algorithm
    1. `[#TD-03]` Feasibility Study on using VueJS for SVG diagram generation
    1. `[#TD-04]` Implement box drawing
    1. `[#TD-05]` Implement box-size estimation
    1. `[#TD-06]` Implement box-location assignment algorithm
    1. `[#TD-07]` Implement assocication link drawing
1. User Interface
    1. `[#TI-01]` Design HTML layout
    1. `[#TI-02]` Implement HTML layout
    1. `[#TI-03]` Implement image export
1. System integration
    1. `[#TI-04]` Integrate the UI to the system
    1. `[#TI-05]` Integrate the text-analysis and the drawing modules
1. Deployment
    1. `[#TY-01]` Setup server VM
    1. `[#TY-02]` Setup Apache server
    1. `[#TY-03]` Deploy application


Draft Custom Syntax Design
==================================================
<pre>
title Graph Title

class A
+ attr1 : int
# attr2 : string
- attr3 : double
~ attr4 : B
+ method1():void
# method2(a:int, b:byte[]):int

interface B
+ method1():string
+ method2(str:string...):double
</pre>

Class A, has 4 attributes, which are:
- public integer attr1
- protected string attr2
- private double attr3
- internal B attr4
and 2 methods:
- public function method1 with no paramters, returns nothing 
- protected function method2 with 2 paramters: 1 int, 1 byte[]; returns an integer

Interface B, has 2 methods
- method1 with no parameters, returns a string
- method2 with paramter array of strings, returns a double

SVG - Scalable Vector Graphics
==================================================
The svg element draw in its own canvas. It draws the elements
according to the `viewBox`. The `viewBox` consists of 4 values,
e.g. `viewBox="-10 0 20 40"`, which are starting `x` and `y`,
as well as `width` and `height` respectively.

Only 3 elements are required in the graph:
[`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text),
[`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect),
[`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path).
