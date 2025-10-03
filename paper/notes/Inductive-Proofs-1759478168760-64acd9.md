# Inductive Proofs

## Introduction
**Mathematical induction** is a powerful and fundamental method used to establish results, statements, or conjectures for natural numbers [byjus], [TPT]. It is a technique specifically designed to prove that a given statement or theorem holds true for **all natural numbers** [byjus]. The concept is particularly useful when proving statements that apply to an infinite sequence of numbers or when a pattern continues indefinitely [TPT].

## TL;DR
*   **Mathematical Induction** proves statements for all natural numbers [byjus].
*   It consists of two main parts: the **Base Case** and the **Inductive Step** [byjus], [TPT].
*   **Base Case**: Show the statement is true for the first natural number (e.g., n=1) [byjus], [GFG].
*   **Inductive Step**: Assume the statement is true for an arbitrary natural number **k** (**Inductive Hypothesis**), then prove it must also be true for **k+1** [byjus], [GFG].
*   Widely used in **Computer Science** for algorithms and data structures [GFG].

## What is Mathematical Induction?
**Mathematical induction** is defined as a method used to establish results for **natural numbers** [byjus]. It is generally applied to prove that a statement or theorem holds true for all natural numbers [byjus]. This method is suitable for proving statements that apply to all numbers beyond a certain threshold or for an infinite sequence of natural numbers [TPT]. Any statement P(n), where 'n' is a natural number, can be proven using this principle [GFG].

## Principle of Mathematical Induction (PMI) and its Structure
The **Principle of Mathematical Induction** (PMI) provides a formal structure for proving statements about natural numbers [TPT]. It involves two crucial steps [byjus], [TPT]:

1.  **State the Proposition P(n)**: Clearly define the statement P(n) that needs to be proven for all natural numbers 'n' (or for n beyond a certain threshold) [TPT].
2.  **Base Case (or Initial Value)**:
    *   Prove that the statement P(n) is true for the initial value of 'n' [byjus], typically **n = 1** [byjus], [GFG].
    *   This is a factual statement that establishes the starting point for the induction [byjus].
3.  **Inductive Step**: This step itself has two parts:
    *   **Inductive Hypothesis**: Assume that the statement P(k) is true for some arbitrary positive integer **k**, where **k** is greater than or equal to the initial value (e.g., k ≥ 1) [GFG], [TPT].
    *   **Inductive Proof**: Prove that if P(k) is true, then P(k+1) must also be true [byjus], [GFG], [TPT]. This means showing that the truth of the statement for 'k' implies its truth for 'k+1' [byjus]. This is a conditional statement [byjus].

## Steps for an Inductive Proof
To formally carry out a proof using mathematical induction, follow these steps:

1.  **Define the Statement P(n)**: Clearly state the proposition P(n) that you intend to prove [TPT].
2.  **Establish the Base Case**:
    *   Show that P(n) is true for the smallest relevant natural number, often **n = 1** [TPT], [byjus].
    *   Substitute this initial value into the statement and verify its truth [TPT].
3.  **Formulate the Inductive Hypothesis**:
    *   Assume that P(k) is true for some positive integer **k** (where k ≥ the base case value) [GFG], [TPT].
    *   This assumption is crucial for the next step.
4.  **Perform the Inductive Step**:
    *   Using the **Inductive Hypothesis** (P(k) is true), prove that P(k+1) is also true [GFG], [TPT].
    *   This typically involves manipulating the expression for P(k+1) and substituting or utilizing the assumed truth of P(k).
5.  **Conclusion**: Once both the Base Case and the Inductive Step are proven, you can conclude that P(n) is true for all natural numbers 'n' (or for all n ≥ the base case value) [GFG].

The process can be visualized as a flowchart:

```mermaid
graph TD
    A[Start Inductive Proof] --> B{Define P(n) and initial n_0};
    B --> C[Base Case: Prove P(n_0) is true];
    C -- If P(n_0) is false --> H[Proof Fails];
    C -- If P(n_0) is true --> D[Inductive Hypothesis: Assume P(k) is true for k >= n_0];
    D --> E[Inductive Step: Prove P(k+1) is true using P(k)];
    E -- If P(k+1) cannot be proven --> H;
    E -- If P(k+1) is proven --> F[Conclusion: P(n) is true for all n >= n_0];
    F --> G[End Proof];
```

## Applications and Importance
**Mathematical induction** is typically used to prove that a given statement holds true for all natural numbers [byjus]. Its importance stems from several aspects:

*   **Establishing Patterns**: It shows how to establish that a pattern continues indefinitely [TPT].
*   **Simplifying Proof Structure**: It simplifies the structure of proofs for statements involving sequences and natural numbers [TPT].
*   **Computer Science**: Induction is widely used in Computer Science because many concepts are naturally **recursive** or **iterative**, and induction mirrors that structure [GFG]. Specific applications include:
    *   Proving the correctness of algorithms [GFG].
    *   Verifying properties of data structures.
    *   Proving loop invariants in programming [GFG].

## Examples

### Example 1: Sum of the First n Natural Numbers
Prove that for all natural numbers n, **1 + 2 + 3 + ... + n = [n(n + 1)]/2** [GFG], [TPT].

**Solution**:
1.  **Define P(n)**: Let P(n) be the statement **1 + 2 + 3 + ... + n = n(n + 1)/2** [TPT].
2.  **Base Case (n = 1)**:
    *   LHS: 1 [TPT].
    *   RHS: 1(1 + 1)/2 = 1(2)/2 = 1 [TPT].
    *   Since LHS = RHS, P(1) is true [TPT].
3.  **Inductive Hypothesis**: Assume P(k) is true for some positive integer k.
    *   So, assume **1 + 2 + 3 + ... + k = k(k + 1)/2** [TPT].
4.  **Inductive Step**: Prove P(k+1) is true, i.e., prove **1 + 2 + 3 + ... + k + (k + 1) = (k + 1)((k + 1) + 1)/2**.
    *   Start with the LHS of P(k+1):
        **1 + 2 + 3 + ... + k + (k + 1)**
    *   By the Inductive Hypothesis, we know that **1 + 2 + 3 + ... + k = k(k + 1)/2**.
    *   Substitute this into the LHS:
        **k(k + 1)/2 + (k + 1)**
    *   Factor out (k + 1):
        **(k + 1) [k/2 + 1]**
        **(k + 1) [(k + 2)/2]**
        **(k + 1)(k + 2)/2**
    *   This is equal to **(k + 1)((k + 1) + 1)/2**, which is the RHS of P(k+1).
    *   Thus, P(k+1) is true if P(k) is true.
5.  **Conclusion**: By the Principle of Mathematical Induction, P(n) is true for all natural numbers n.

### Example 2: Sum of Cubes of n Natural Numbers
Prove that **1³ + 2³ + 3³ + ... + n³ = ([n(n+1)]/2)²** for all natural numbers n [byjus], [GFG].

**Solution**:
1.  **Define P(n)**: Let P(n) be the statement **1³ + 2³ + 3³ + ... + n³ = ([n(n+1)]/2)²**.
2.  **Base Case (n = 1)**:
    *   LHS: 1³ = 1.
    *   RHS: ([1(1+1)]/2)² = ([1*2]/2)² = (1)² = 1.
    *   Since LHS = RHS, P(1) is true.
3.  **Inductive Hypothesis**: Assume P(k) is true for some positive integer k.
    *   So, assume **1³ + 2³ + 3³ + ... + k³ = ([k(k+1)]/2)²**.
4.  **Inductive Step**: Prove P(k+1) is true, i.e., prove **1³ + 2³ + ... + k³ + (k+1)³ = ([(k+1)((k+1)+1)]/2)²**.
    *   Start with the LHS of P(k+1):
        **1³ + 2³ + ... + k³ + (k+1)³**
    *   By the Inductive Hypothesis:
        **([k(k+1)]/2)² + (k+1)³**
    *   Expand and simplify:
        **k²(k+1)²/4 + (k+1)³**
        **(k+1)² [k²/4 + (k+1)]**
        **(k+1)² [(k² + 4k + 4)/4]**
        **(k+1)² [(k + 2)²/4]**
        **[(k+1)(k+2)/2]²**
    *   This is equal to **([(k+1)((k+1)+1)]/2)²**, which is the RHS of P(k+1).
    *   Thus, P(k+1) is true if P(k) is true.
5.  **Conclusion**: By the Principle of Mathematical Induction, P(n) is true for all natural numbers n.

### Example 3: Divisibility
Prove that **6ⁿ - 1** is always a multiple of 5 for all natural numbers n [TPT].

**Solution**:
1.  **Define P(n)**: Let P(n) be the statement that **6ⁿ - 1** is a multiple of 5 [TPT].
2.  **Base Case (n = 1)**:
    *   For n = 1, **6¹ - 1 = 5**.
    *   Since 5 is a multiple of 5, P(1) is true [TPT].
3.  **Inductive Hypothesis**: Assume P(k) is true for some positive integer k.
    *   So, assume **6ᵏ - 1** is a multiple of 5. This means **6ᵏ - 1 = 5m** for some integer m [TPT].
    *   Therefore, **6ᵏ = 5m + 1** [TPT].
4.  **Inductive Step**: Prove P(k+1) is true, i.e., prove **6ᵏ⁺¹ - 1** is a multiple of 5.
    *   Consider **6ᵏ⁺¹ - 1**:
        **6ᵏ⁺¹ - 1 = 6 * 6ᵏ - 1**
    *   Substitute **6ᵏ = 5m + 1** from the Inductive Hypothesis:
        **6 * (5m + 1) - 1**
        **30m + 6 - 1**
        **30m + 5**
        **5(6m + 1)**
    *   Since **5(6m + 1)** is a product of 5 and an integer (6m+1), it is a multiple of 5.
    *   Thus, P(k+1) is true if P(k) is true.
5.  **Conclusion**: By the Principle of Mathematical Induction, P(n) is true for all natural numbers n.

## Practice Problems
1.  Prove that **1 × 1! + 2 × 2! + 3 × 3! + ... + n × n! = (n + 1)! – 1** for all natural numbers using the principles of mathematical induction [byjus].
2.  Prove that **4ⁿ – 1** is divisible by 3 using the principle of mathematical induction [byjus].
3.  Show that for all integers n ≥ 1: **1.2.3 + 2.3.4 + 3.4.5 + ... + n(n + 1)(n + 2) = {n(n + 1)(n + 2)(n + 3)}/4** [GFG].

## Memory Aids
*   **Domino Effect Analogy**: Imagine an infinitely long line of dominoes.
    *   **Base Case**: If you push the first domino (P(1) is true).
    *   **Inductive Step**: And if, whenever any domino falls (P(k) is true), the next domino also falls (P(k+1) is true).
    *   **Conclusion**: Then all the dominoes will eventually fall (P(n) is true for all n) [Wiki].
*   **Staircase Analogy**: To climb to any step on an infinite staircase, you need to be able to reach the first step (Base Case) and know that if you can reach any step 'k', you can always reach the next step 'k+1' (Inductive Step).

## Common Mistakes
*   **Failing to Prove the Base Case**: The base case is critical as it provides the starting point for the induction. Without it, the inductive step has no foundation.
*   **Assuming P(k+1) is true without proof**: The inductive step requires **proving** P(k+1) using the assumption P(k), not simply stating P(k+1) is true.
*   **Not using the Inductive Hypothesis**: The assumption that P(k) is true must be utilized in some way during the proof of P(k+1). If P(k) is not used, it is often a direct proof instead of an inductive one.
*   **Incorrect Algebraic Manipulation**: Mistakes in algebra during the inductive step can lead to an incorrect conclusion. Pay close attention when simplifying expressions or substituting the inductive hypothesis.
*   **Choosing the Wrong Initial Value**: Sometimes the statement P(n) is true for n ≥ some value `n₀` (e.g., n ≥ 5 for inequalities). Starting the base case at n=1 when `n₀` is larger will result in an incorrect proof.

## Conclusion
Mathematical induction is a fundamental method for proving statements or conjectures about natural numbers and sequences [TPT]. It provides a rigorous framework to establish that a pattern holds true for an infinite set of numbers by demonstrating a starting point and a rule for progression [TPT]. This method simplifies complex proofs and is widely applicable in mathematics, logic, and computer science for verifying the correctness of algorithms and properties of systems [GFG], [TPT].

## CITATIONS
*   [byjus]: `https://byjus.com/maths/principle-of-mathematical-induction-learn-examples/` ("Principle of Mathematical Induction Solution and Proof", "Proof:", "Solved problems", "Practice problems", "Frequently Asked Question on the Principle of Mathematical Induction", "What is meant by mathematical induction?", "Write down the two steps involved in the principles of mathematical induction?", "Why do we use mathematical induction?")
*   [GFG]: `https://www.geeksforgeeks.org/maths/principle-of-mathematical-induction/` ("Principle of Mathematical Induction Statement", "Mathematical Induction Solution and Proof", "Mathematical Induction Example", "PMI in Computer Science", "Solved Examples of Mathematical Induction", "Practice Questions on the Principle of Mathematical Induction")
*   [TPT]: `https://www.tutorialspoint.com/discrete_mathematics/formalizing_preuves_for_mathematical_induction.htm` ("Formalizing Proofs for Mathematical Induction", "Understanding Mathematical Induction", "Structure of an Inductive Proof", "Example 1: Sum of the First n Natural Numbers", "Step-by-Step Proof", "Example 2: Multiple of 5 in Powers of 6", "Example 3: Inequality Using Induction", "Why are Mathematical Inductions Used?")
*   [Wiki]: `https://en.wikipedia.org/wiki/Mathematical_induction` ("It is often illustrated by reference to a chain of dominoes falling, or climbing a ladder.")