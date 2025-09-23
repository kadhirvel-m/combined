# Additional forms of Proof

## Introduction
A **mathematical proof** is a deductive argument for a mathematical statement [Wiki]. It is a convincing demonstration that a statement is true, built upon previously established truths such as axioms, theorems, and definitions [Wiki]. Mathematicians employ various styles of proof, selected based on the nature of the statement and the available tools [GFG].

## TL;DR
*   **Direct Proof**: Assumes **p** is true to show **q** is true for proving **p ⇒ q**.
*   **Indirect Proof (Contraposition)**: Assumes **~q** is true to show **~p** is true for proving **p ⇒ q**.
*   **Proof by Contradiction**: Assumes the negation of the statement (**P ∧ ~Q**) and derives a contradiction.
*   **Proof by Cases**: Evaluates the statement's truth across all possible cases.
*   **Proof by Induction**: Establishes a statement for positive integers by proving a base case and an inductive step.
*   **Disproof by Counterexample**: Proves a statement false by providing a single instance where it doesn't hold.
*   **Trivial Proof**: Used when **Q** in **P ⇒ Q** is inherently true, regardless of **P**.

## Types of Mathematical Proofs
Mathematicians utilize various proof styles, depending on the statement's nature and available tools [GFG]. Common types include:
*   **Direct Proof** [GFG]
*   **Indirect Proof** (also known as Proof by Contraposition) [GFG]
*   **Proof by Contradiction** [GFG]
*   **Proof by Cases** [GFG]
*   **Proof by Induction** [GFG]
*   **Disproof by Counter Example** [GFG]
*   **Trivial Proof** [GFG-Pred]

## Direct Proof
To prove a conditional statement **p ⇒ q**, a **direct proof** assumes that **p** is true and then follows implications to demonstrate that **q** must also be true [GFG]. This method is primarily an application of **hypothetical syllogism** [GFG].

*   **Process**:
    1.  Assume **p** is true.
    2.  Use definitions, axioms, and established theorems to logically derive **q**.
    3.  Conclude that **q** is true if **p** is true.

## Indirect Proof (Proof by Contraposition)
This method, also called **proof by contraposition**, is used to prove a conditional statement **p ⇒ q** [GFG]. Instead of directly proving **p ⇒ q**, one proves its **contrapositive**, which is **~q ⇒ ~p** [GFG]. The contrapositive of a statement is logically equivalent to the original statement.

*   **Process**:
    1.  Assume that **~q** (not **q**) is true.
    2.  Use logical reasoning, definitions, and theorems to show that **~p** (not **p**) must then be true.
    3.  Conclude that since **~q ⇒ ~p** is true, then **p ⇒ q** is also true.

## Proof by Contradiction
In **proof by contradiction**, one assumes the negation of the statement to be proven and then proceeds to derive a contradiction [GFG]. If assuming the negation leads to a contradiction (e.g., a statement that is both true and false, or 1=0), then the original statement must be true [GFG]. This method is common in theoretical computer science to prove impossibility results [GFG].

*   **Process**:
    1.  Assume the negation of the statement to be proven is true. For **p ⇒ q**, this means assuming **p** is true AND **q** is false (i.e., **p ∧ ~q**).
    2.  Proceed with logical deduction from this assumption.
    3.  Reach a statement that contradicts an known truth, an axiom, or even the initial assumption itself.
    4.  Conclude that the initial assumption (the negation of the statement) must be false, therefore the original statement is true.

## Proof by Cases
In this method, the truth of a statement is established by evaluating every possible **case** or scenario [GFG]. This is useful when the statement's hypothesis naturally divides into several distinct conditions. This technique is often employed in algorithm analysis when different inputs trigger different behaviors [GFG].

*   **Process**:
    1.  Identify all possible, mutually exclusive, and exhaustive cases for the statement's hypothesis.
    2.  Prove the statement holds true for each individual case.
    3.  Conclude that since it holds for all cases, it holds generally.
*   **Example**: Proving that for every integer **x**, the integer **x(x + 1)** is even [GFG].
    *   Case 1: **x** is even.
    *   Case 2: **x** is odd.

## Proof by Induction
The **Principle of Mathematical Induction (PMI)** is used to prove statements about positive integers [GFG]. It involves two main steps:

*   **Process**:
    1.  **Base Case**: Prove that the statement **P(n)** is true for the smallest positive integer, typically **n = 1** (i.e., prove **P(1)** is true) [GFG].
    2.  **Inductive Step**: Assume that **P(n)** is true for some arbitrary positive integer **n** (this is the **inductive hypothesis**). Then, prove that this assumption implies the statement is also true for the next integer, **P(n + 1)** [GFG].
    3.  Conclusion: If both steps are true, then **P(n)** is true for all positive integers **n** [GFG].

## Disproof by Counter Example
In this technique, a given statement is disproved by simply providing a **counterexample** [GFG]. A single counterexample is sufficient to demonstrate that a universal statement ("for all...") is false [GFG]. This is often used in testing and debugging in computer science [GFG].

*   **Process**:
    1.  Identify a specific instance (a counterexample) that satisfies the conditions of the statement but for which the conclusion is false.
    2.  Show that this instance disproves the general statement.
*   **Example**: Disproving the conjecture, "For every positive integer **n**, **n! ≤ n²**" [GFG].
    *   For **n = 1**, **1! = 1**, **1² = 1**. Here **1 ≤ 1** is true.
    *   For **n = 2**, **2! = 2**, **2² = 4**. Here **2 ≤ 4** is true.
    *   For **n = 3**, **3! = 6**, **3² = 9**. Here **6 ≤ 9** is true.
    *   For **n = 4**, **4! = 24**, **4² = 16**. Here **24 ≤ 16** is false.
    *   Thus, **n = 4** is a counterexample, disproving the conjecture.

## Trivial Proof
A **trivial proof** is used when proving an implication **P ⇒ Q**, and it is known that the consequent **Q** is always true, regardless of the truth value of **P** [GFG-Pred]. If **Q** is true, then the implication **P ⇒ Q** is always true.

*   **Example**: "If it is raining (P), then 2+2=4 (Q)." Since **2+2=4** is always true, the implication is trivially true.

## Solved Examples
Here are examples demonstrating various proof techniques:

1.  **Statement**: Prove that if **n** is an odd integer, then **n²** is odd [GFG].
    *   **Proof (Direct Proof)**:
        *   Assume **n** is an odd integer. By definition, an odd integer can be written as **n = 2k + 1** for some integer **k**.
        *   Then **n² = (2k + 1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1**.
        *   Since **2k² + 2k** is an integer, let **m = 2k² + 2k**.
        *   Then **n² = 2m + 1**, which by definition means **n²** is odd.
        *   Therefore, if **n** is an odd integer, then **n²** is odd [GFG].

2.  **Statement**: Prove that **√2** is irrational [GFG].
    *   **Proof (Proof by Contradiction)**:
        *   Assume, for the sake of contradiction, that **√2** is rational.
        *   If **√2** is rational, it can be written as **a/b**, where **a** and **b** are integers, **b ≠ 0**, and **a/b** is in its simplest form (i.e., **a** and **b** have no common factors other than 1).
        *   **√2 = a/b**
        *   **2 = a²/b²**
        *   **2b² = a²**
        *   This implies that **a²** is an even number. If **a²** is even, then **a** must also be an even number (since the square of an odd number is odd).
        *   Since **a** is even, we can write **a = 2k** for some integer **k**.
        *   Substitute **a = 2k** into **2b² = a²**:
        *   **2b² = (2k)²**
        *   **2b² = 4k²**
        *   **b² = 2k²**
        *   This implies that **b²** is an even number. If **b²** is even, then **b** must also be an even number.
        *   So, both **a** and **b** are even numbers. This means they both have a common factor of 2.
        *   However, this contradicts our initial assumption that **a/b** was in its simplest form (i.e., **a** and **b** have no common factors other than 1).
        *   Therefore, our initial assumption that **√2** is rational must be false.
        *   Hence, **√2** is irrational [GFG].

3.  **Statement**: Prove that there is no smallest positive rational number [GFG].
    *   **Proof (Proof by Contradiction)**:
        *   Assume, for the sake of contradiction, that there exists a smallest positive rational number. Let's call it **r**.
        *   Since **r** is a positive rational number, **r > 0**.
        *   Consider the number **r/2**.
        *   Since **r** is rational, **r/2** is also rational (a rational number divided by a non-zero integer is rational).
        *   Also, since **r > 0**, it follows that **r/2 > 0**.
        *   Furthermore, **r/2 < r** (dividing a positive number by 2 results in a smaller positive number).
        *   This means **r/2** is a positive rational number that is smaller than **r**.
        *   This contradicts our initial assumption that **r** was the *smallest* positive rational number.
        *   Therefore, our initial assumption must be false.
        *   Hence, there is no smallest positive rational number [GFG].

## Practice Problems
1.  Prove that for all real numbers **x**, if **x² > 4**, then **x > 2** or **x < -2** [GFG-Pred].
2.  Prove that for all integers **n**, if **n** is odd, then **n²** is odd [GFG-Pred].
3.  Disprove the statement: For all real numbers **x** and **y**, if **x² = y²**, then **x = y** [GFG-Pred].

## Summary
The process of proving mathematical statements relies on various techniques, each suited for different problem structures [GFG-Pred]. These include **direct proofs**, **proof by contraposition**, **proof by contradiction**, and **proof by cases**, which are foundational for establishing the truth of mathematical propositions [GFG-Pred]. **Proof by induction** is vital for statements involving positive integers, while **disproof by counterexample** provides an efficient way to invalidate universal claims.

## Mermaid Diagram: Proof Type Selection Flowchart

```mermaid
graph TD
    A[Start: Goal is to Prove Statement S] --> B{Is S a Conditional Statement P ⇒ Q?};

    B -- No --> C{Is S a Universal Statement "For all x, P(x)"?};
    C -- Yes --> D{Are there integers involved?};
    D -- Yes --> E[Try Proof by Induction];
    D -- No --> F{Are there distinct cases for x?};
    F -- Yes --> G[Try Proof by Cases];
    F -- No --> H{Is the goal to DISPROVE "For all x, P(x)"?};
    H -- Yes --> I[Try Disproof by Counterexample];
    H -- No --> J[Consider Proof by Contradiction];

    B -- Yes --> K{Is Q always true, regardless of P?};
    K -- Yes --> L[Try Trivial Proof];
    K -- No --> M{Can Q be directly derived from P?};
    M -- Yes --> N[Try Direct Proof];
    M -- No --> O{Can ~P be derived from ~Q?};
    O -- Yes --> P[Try Indirect Proof (Contraposition)];
    O -- No --> Q{Can a contradiction be reached by assuming P AND ~Q?};
    Q -- Yes --> R[Try Proof by Contradiction];
    Q -- No --> S[Re-evaluate statement, try other methods or combination];
```

## Memory Aids
*   **D.I.C.P.I.C.T.** - **D**irect, **I**ndirect (**C**ontraposition), **P**roof by **C**ontradiction, **I**nduction, **C**ases, **T**rivial.
*   **Direct**: "P leads to Q." Straightforward.
*   **Contrapositive**: "If NOT Q, then NOT P." Flip and negate.
*   **Contradiction**: "Assume the opposite, then break something."
*   **Cases**: "Divide and conquer" for different scenarios.
*   **Induction**: "Ladder principle" – if you can get on the first rung and climb to the next, you can climb the whole ladder.
*   **Counterexample**: "One bad apple spoils the bunch."
*   **Trivial**: "Q is true, so P doesn't matter."

## Common Mistakes
*   **Confusing Proof by Contraposition with Proof by Contradiction**: While both are indirect, contraposition assumes **~q** to prove **~p** directly. Contradiction assumes the *negation of the entire statement* and seeks any contradiction, not just **~p** [needs review].
*   **Assuming the Conclusion**: In a direct proof, one must not use the statement to be proven as an intermediate step.
*   **Insufficient Cases**: In proof by cases, failing to cover all possible, mutually exclusive scenarios will render the proof invalid.
*   **Incorrect Base Case or Inductive Step**: In induction, errors in establishing **P(1)** or proving **P(n) ⇒ P(n+1)** can invalidate the entire proof.
*   **Single Counterexample for Proof**: A single example proving a universal statement is insufficient; a single example can only *disprove* a universal statement.
*   **Logical Fallacies**: Introducing non-sequiturs or other logical errors can invalidate any proof.

## Conclusion
Mathematical proofs are fundamental to establishing the certainty of mathematical truths. By understanding and applying various proof techniques—such as direct, indirect, contradiction, cases, induction, and counterexample—students can rigorously demonstrate the validity of mathematical statements. Each method offers a unique approach to problem-solving, making the choice of method crucial for an effective and sound argument.

## CITATIONS
*   [GFG] https://www.geeksforgeeks.org/maths/mathematics-introduction-to-proofs/
    *   Quoted: "Mathematicians use several styles of proof, depending on the nature of the statement being proven and the tools available. The most common types are:…", "[Proof by Cases] In this method, we evaluate every case of the statement to conclude its truthiness. Example: For every integer x, the integer x(x + 1) is even Used in algorithm analysis when different inputs cause th…", "[Proof by Contradiction] We assume the negation of the given statement and then proceed to conclude the proof. Example: Prove that sqrt(2) is irrational. Common in theoretical computer science to prove impossibility results o…", "[Proof by Induction] The Principle of Mathematical Induction (PMI). Let P(n) be a statement about the positive integer n. If the following are true: 1. P(1), 2. (for all n there exists Z+) P(n) implies P(n + 1), Then (for…", "[Direct Proof] When we want to prove a conditional statement p implies q, we assume that p is true, and follow implications to get to show that q is then true. It is Mostly an application of hypothetical syllogism, …", "[Indirect Proof] This method is also called as proof by contraposition. In this method to prove a conditional statement p → q, we assume that ∼q is true and then follow the implication by applying knowledge and facts …", "[Disproof by Counter Example] In this proof technique, a given statement is disproved by providing a counterexample. Example: Prove or disprove the conjecture, 'For every positive integer n, n! <= n 2 . Used in testing and debuggi…", "[Solved Examples] Statement: Prove that if n is an odd integer, then n 2 is odd. Proof: Statement: Prove that there is no smallest positive rational number. Proof: Statement: Prove that if n is not divisible by 3, then…"
*   [GFG-Pred] https://www.geeksforgeeks.org/engineering-mathematics/types-of-proofs-predicate-logic-discrete-mathematics/
    *   Quoted: "[Types Of Proofs] Let's say we want to prove the implication P ⇒ Q. Here are a few options for you to consider. 1. Trivial Proof - If we know Q is true, then P ⇒ Q is true no matter what P's truth value is. Example - I…", "[Solved Examples on Types of Proofs - Predicate Logic] Certainly. I'll provide 10 solved examples covering various types of proofs in predicate logic. These examples will demonstrate different proof techniques and concepts. Example 1: Direct Proof Prove: …", "[Practice Problems on Types of Proofs - Predicate Logic] 1).Prove that for all real numbers x, if x 2 > 4, then x > 2 or x < -2. 2).Prove that for all integers n, if n is odd, then n 2 is odd. 3).Disprove the statement: For all real numbers x and y, if x 2 …", "[Summary] Types of proofs in predicate logic include direct proofs, proof by contraposition, proof by contradiction, and proof by cases. These techniques are used to establish the truth or falsity of mathematic…"
*   [Wiki] https://en.wikipedia.org/wiki/Mathematical_proof
    *   Quoted: "Mathematical proof is a deductive argument for a mathematical statement.", "It is a convincing demonstration that a mathematical statement is true. Proofs are obtained by means of deductive reasoning, rather than by inductive or empirical arguments."
*   [Wiki-Direct] https://en.wikipedia.org/wiki/Direct_proof
    *   Content indirectly used for understanding.
*   [Wiki-Contradiction] https://en.wikipedia.org/wiki/Proof_by_contradiction
    *   Content indirectly used for understanding.