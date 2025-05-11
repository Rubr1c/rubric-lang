// Rubric Lang Demo File

// 1. Comments
// This is a single-line comment

/*
  This is a
  multi-line comment.
*/

// 2. Data Types & Literals
display("--- Data Types & Literals ---");
var intVar: int = 10;
var floatVar: float = 3.14;
var boolVar: boolean = true;
var stringVar: string = "Hello, Rubric!";
var inferredIntVar = -5;
var inferredFloatVar = -0.5;
var inferredBoolVar = false;
var inferredStringVar = 'Rubric Rocks!';
var uninitializedVar; // Defaults to NullValue, type 'any'

display("Integer:", intVar);
display("Float:", floatVar);
display("Boolean:", boolVar);
display("String:", stringVar);
display("Inferred Integer:", inferredIntVar);
display("Inferred Float:", inferredFloatVar);
display("Inferred Boolean:", inferredBoolVar);
display("Inferred String:", inferredStringVar);
display("Uninitialized Variable:", uninitializedVar); // Output will show 'null'

const constIntVar: int = 100;
const constStringVar: string = "This is a constant";
display("Constant Integer:", constIntVar);
display("Constant String:", constStringVar);

// Attempting to reassign a const will cause an error (not shown in demo output)
// constIntVar = 200; 

// 3. Variables & Assignment
display("--- Variables & Assignment ---");
var mutableVar: int = 5;
display("Initial mutableVar:", mutableVar);
mutableVar = 15;
display("Updated mutableVar:", mutableVar);

// 4. Operators
display("--- Operators ---");
// Arithmetic
var a: int = 10;
var b: int = 3;
var c: float = 2.5;
display("a + b:", a + b);       // 13
display("a - b:", a - b);       // 7
display("a * b:", a * b);       // 30
display("a / b:", a / b);       // 3 (integer division)
display("a % b:", a % b);       // 1
display("a + c:", a + c);       // 12.5 (float result)
display("10 / 4:", 10 / 4);     // 2
display("10.0 / 4:", 10.0 / 4); // 2.5
display("10 / 4.0:", 10 / 4.0); // 2.5

// Comparison
display("a == 10:", a == 10);    // true
display("a != 10:", a != 10);    // false
display("a < 5:", a < 5);      // false
display("a > 5:", a > 5);      // true
display("a <= 10:", a <= 10);  // true
display("a >= 10:", a >= 10);  // true

// Logical
var t: boolean = true;
var f: boolean = false;
display("t && f:", t && f);    // false
display("t || f:", t || f);    // true
display("!t:", !t);          // false
display("!f:", !f);          // true

// Increment/Decrement
display("--- Increment/Decrement Operators ---");
var count: int = 0;
display("Initial count:", count); // 0
display("++count (prefix):", ++count); // 1 (value of expression is 1)
display("count after prefix++:", count); // 1
display("count++ (postfix):", count++); // 1 (value of expression is 1, then count becomes 2)
display("count after postfix++:", count); // 2
display("--count (prefix):", --count); // 1 (value of expression is 1)
display("count after prefix--:", count); // 1
display("count-- (postfix):", count--); // 1 (value of expression is 1, then count becomes 0)
display("count after postfix--:", count); // 0

var floatCount: float = 1.5;
display("Initial floatCount:", floatCount); // 1.5
display("++floatCount:", ++floatCount);     // 2.5
display("floatCount++:", floatCount++);     // 2.5 (then 3.5)
display("floatCount after postfix++:", floatCount); // 3.5

// Ternary Operator
display("--- Ternary Operator ---");
var age: int = 20;
var beverage: string = age >= 18 ? "Beer" : "Juice";
display("Age:", age, "Beverage:", beverage); // Age: 20 Beverage: Beer
age = 16;
beverage = age >= 18 ? "Beer" : "Juice";
display("Age:", age, "Beverage:", beverage); // Age: 16 Beverage: Juice

// 5. Control Flow
display("--- Control Flow ---");
// If-Else Statements
var num: int = 10;
display("Number is:", num);
if (num > 0) {
  display("Number is positive.");
} else if (num < 0) {
  display("Number is negative.");
} else {
  display("Number is zero.");
}

num = -5;
display("Number is:", num);
if (num > 0) {
  display("Number is positive.");
} else if (num < 0) {
  display("Number is negative.");
} else {
  display("Number is zero.");
}

num = 0;
display("Number is:", num);
if (num > 0) {
  display("Number is positive.");
} else {
  display("Number is not positive (zero or negative).");
}

// For Loops
display("--- For Loop ---");
for (var i: int = 0; i < 3; i = i + 1) {
  display("For loop iteration:", i);
}


// While Loops
display("--- While Loop ---");
var j: int = 0;
while (j < 3) {
  display("While loop iteration:", j);
  j = j + 1;
}

// Do-While Loops
display("--- Do-While Loop ---");
var m: int = 0;
do {
  display("Do-while loop iteration:", m);
  m = m + 1;
} while (m < 3);

var n: int = 5;
display("Do-while (condition initially false):");
do {
    display("This will run once. n:", n);
    n = n + 1;
} while (n < 5);

// 6. Functions
display("--- Functions ---");

// Function Declaration
fn greet(name: string): void {
  display("Hello,", name, "from a declared function!");
}
greet("Alice");

fn add(x: int, y: int): int {
  return x + y;
}
var sum: int = add(5, 7);
display("Sum from add(5,7):", sum);

// Function Literal (Anonymous Function)
var multiply = fn(a: int, b: int): int {
  return a * b;
};
var product: int = multiply(4, 6);
display("Product from multiply(4,6):", product);

// Functions with implicit return (last expression)
fn subtract(a: int, b: int): int {
  a - b; // This will be returned
}
display("Subtract 10 - 4:", subtract(10, 4));

// Void function with implicit null return
fn logMessage(message: string): void {
    display("LOG:", message);
    // no explicit return, returns NullValue
}
logMessage("Testing void return"); // void functions return NullValue, not typically assigned
display("Result of void function call (inspecting NullValue implicitly):"); // display will handle NullValue

// Recursion
fn factorial(n: int): int {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}
display("Factorial of 5:", factorial(5)); // 120

// 7. Scoping
display("--- Scoping ---");
var globalVar: int = 100;
display("Global var before block:", globalVar);

{
  var blockVar: int = 200;
  display("Inside block - globalVar:", globalVar); // Can access outer scope
  display("Inside block - blockVar:", blockVar);
  globalVar = 150; // Can modify outer scope var
}

display("Global var after block:", globalVar); // Shows modification
// display(blockVar); // This would cause an error: blockVar not defined here

fn scopeTest(): void {
  var functionScopeVar: string = "I'm in a function";
  display(functionScopeVar);
  display("Inside function - globalVar:", globalVar);
}
scopeTest();
// display(functionScopeVar); // Error: not defined here

// Shadowing
var shadowVar: int = 1;
display("Outer shadowVar:", shadowVar);
{
    var shadowVar: int = 2; // This shadows the outer one
    display("Inner shadowVar:", shadowVar);
}
display("Outer shadowVar after block:", shadowVar); // Still 1


display("--- End of Demo ---");