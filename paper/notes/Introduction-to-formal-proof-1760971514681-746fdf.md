# Introduction to formal proof

## Introduction
Formal proofs are fundamental to mathematics and computer science, serving as a rigorous method to establish the truth of statements or theorems. A **proof** is essentially a convincing argument that a mathematical statement is true [Wiki]. These notes will introduce various styles of mathematical proofs, highlighting their definitions, applications, and providing examples [GFG]. Understanding formal proof techniques is crucial for demonstrating the correctness of algorithms, verifying system properties, and building robust theoretical foundations.

## TL;DR
*   **Formal proof** uses logical steps to establish the truth of a statement.
*   **Direct Proof**: Assumes `p` is true to show `q` is true (for `p → q`).
*   **Indirect Proof (Contraposition)**: Assumes `~q` is true to show `~p` is true (for `p → q`).
*   **Proof by Cases**: Evaluates all possible scenarios to confirm a statement's truth.
*   **Proof by Contradiction**: Assumes the opposite of the statement is true, then derives a logical inconsistency.
*   **Proof by Induction**: Establishes a statement for all natural numbers by proving a base case and an inductive step.
*   **Disproof by Counter Example**: Shows a statement is false by providing just one instance where it doesn't hold.

## Types of Mathematical Proofs
Mathematicians employ several styles of proof, chosen based on the nature of the statement being proven and the available tools [GFG]. The most common types include:

### Direct Proof
In a **direct proof**, to prove a conditional statement `p → q` (**p implies q**), we assume that **p** is true and then follow a sequence of logical implications and known facts to demonstrate that **q** must also be true [GFG]. This method primarily relies on the application of hypothetical syllogism [GFG].

### Indirect Proof (Proof by Contraposition)
Also known as **proof by contraposition**, this method is used to prove a conditional statement `p → q` [GFG]. Instead of directly proving `p → q`, we assume that the negation of **q** (`~q`) is true and then follow logical implications to show that the negation of **p** (`~p`) must also be true [GFG]. This works because `p → q` is logically equivalent to `~q → ~p`.

### Proof by Cases
**Proof by cases** involves evaluating every possible case of a statement to conclusively establish its truth [GFG]. This technique is particularly useful in algorithm analysis when different inputs might lead to different execution paths or outcomes [GFG].
*   **Example**: Proving that for every integer **x**, the integer **x(x + 1)** is always even [GFG].

### Proof by Contradiction
In a **proof by contradiction**, we begin by assuming the negation of the statement we want to prove [GFG]. We then proceed with logical deductions from this assumption, aiming to arrive at a conclusion that is known to be false or that contradicts our initial assumption or established facts [GFG]. This contradiction implies that our initial assumption (the negation of the statement) must be false, thus proving the original statement true.
*   **Example**: Proving that **sqrt(2)** is irrational [GFG].
*   **Application**: Commonly used in theoretical computer science to prove impossibility results [GFG].

### Proof by Induction
**Proof by induction** is based on the **Principle of Mathematical Induction (PMI)** [GFG]. It is typically used to prove statements that apply to all positive integers **n**. For a statement **P(n)** about a positive integer **n**, the proof requires two main steps:
1.  **Base Case**: Prove that **P(1)** is true [GFG].
2.  **Inductive Step**: Assume that **P(n)** is true for some arbitrary positive integer **n** (this is the **inductive hypothesis**). Then, show that this assumption implies **P(n + 1)** is also true [GFG].
If both steps are successfully demonstrated, then the principle concludes that **P(n)** is true for all positive integers **n** [GFG].

```mermaid
graph TD
    A[Start: Statement P(n) for all positive integers n] --> B{Is P(1) True?};
    B -- Yes --> C[Assume P(n) is true (Inductive Hypothesis)];
    C --> D{Does P(n) imply P(n+1) is true?};
    D -- Yes --> E[P(n) is true for all positive integers n];
    B -- No --> F[Proof Fails: Base Case Not Met];
    D -- No --> G[Proof Fails: Inductive Step Not Met];
```

### Disproof by Counter Example
In the **disproof by counter example** technique, a given statement or conjecture is shown to be false by providing just one specific instance, or **counterexample**, where the statement does not hold true [GFG].
*   **Example**: Disproving the conjecture, "For every positive integer **n**, **n! <= n^2**" [GFG].
*   **Application**: Often used in testing and debugging processes in software development to find flaws [GFG].

## Examples
Here are some statements and their proof types, as noted in the source:

1.  **Statement**: Prove that if **n** is an odd integer, then **n^2** is odd [GFG].
    *   **Proof Type Hint**: This is typically proven using a **Direct Proof**. Assume **n** is odd, meaning **n = 2k + 1** for some integer **k**. Then **n^2 = (2k + 1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1**, which is in the form of an odd number.
2.  **Statement**: Prove that there is no smallest positive rational number [GFG].
    *   **Proof Type Hint**: This is typically proven using **Proof by Contradiction**. Assume there is a smallest positive rational number, say **r**. Then consider **r/2**. **r/2** is also a positive rational number and is smaller than **r**, which contradicts the assumption that **r** was the smallest.
3.  **Statement**: Prove that if **n** is not divisible by 3, then... [GFG].
    *   **Proof Type Hint**: The statement is incomplete in the source [GFG], but such a proof often uses **Proof by Cases** (considering **n = 3k+1** and **n = 3k+2**) or an **Indirect Proof**.

## Conclusion
Formal proofs are the backbone of mathematical and logical reasoning, providing undeniable certainty in conclusions. Mastering different proof techniques equips individuals with critical thinking skills applicable across various domains, from theoretical mathematics to practical computer science. Each method offers a unique approach to constructing valid arguments, ensuring that assertions are grounded in logic and established facts.

## Memory Aids
*   **Direct**: "Straightforward path from A to B." (Assume `p`, get `q`)
*   **Contrapositive**: "Flipping and negating the path." (Assume `~q`, get `~p`)
*   **Contradiction**: "Assume opposite, find a lie." (Assume `~P`, find `False`)
*   **Induction**: "Domino effect." (Base case + step-by-step truth)
*   **Cases**: "Cover all bases." (Examine all possibilities)
*   **Counter Example**: "One flaw breaks the whole." (Find one instance where it fails)

## Common Mistakes
*   **Circular Reasoning**: Assuming the conclusion within the proof itself [needs review].
*   **Insufficient Cases**: Not covering all possible scenarios in a proof by cases, leaving gaps [needs review].
*   **Incorrect Base Case or Inductive Step**: Errors in the foundational steps of an inductive proof can invalidate the entire argument [needs review].
*   **Logical Gaps**: Jumping to conclusions without explicit logical steps or citing established theorems/axioms [needs review].
*   **Confusing `p → q` with `q → p`**: Assuming the converse is true when only the original conditional statement is given [needs review].
*   **Misinterpreting "Proof by Contradiction"**: Not clearly identifying the contradiction or assuming the negation incorrectly [needs review].

## CITATIONS
*   **[GFG]**: GeeksforGeeks, "Introduction to Proofs," `https://www.geeksforgeeks.org/maths/mathematics-introduction-to-proofs/`
*   **[Wiki]**: Wikipedia, "Formal proof," `https://en.wikipedia.org/wiki/Formal_proof` and "Mathematical proof," `https://en.wikipedia.org/wiki/Mathematical_proof` (general reference for Wikipedia's domain on proofs)