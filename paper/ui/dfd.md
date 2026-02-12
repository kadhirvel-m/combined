# Eigenvalues and Eigenvectors

## 1. Introduction
Eigenvalues and Eigenvectors are the heartbeat of engineering mathematics. They help us understand how a system changes or scales without changing direction. They are used everywhere: from determining if a bridge will collapse (resonance) to how Google ranks websites (PageRank algorithm).

## 2. Key Idea (Very Short Theory)
*   When a matrix **A** is multiplied by a vector **X**, the result is usually a new vector with a different direction.
*   Sometimes, the result is just the *same* vector **X** scaled by a number **$\lambda$**.
*   The equation is: **$AX = \lambda X$**
    *   **$\lambda$ (Lambda)** is the **Eigenvalue** (Scalar/Magnitude).
    *   **$X$** is the **Eigenvector** (Direction).

## 3. Important Formulae

| Concept | Formula / Method | Meaning |
| :--- | :--- | :--- |
| **Characteristic Equation** | $|A - \lambda I| = 0$ | Solved to find values of $\lambda$. |
| **Eigenvector Equation** | $(A - \lambda I)X = 0$ | Solved to find vector $X$ for each $\lambda$. |
| **Property 1 (Trace)** | $\sum \lambda_i = \text{Trace}(A)$ | Sum of eigenvalues = Sum of diagonal elements. |
| **Property 2 (Determinant)** | $\Pi \lambda_i = |A|$ | Product of eigenvalues = Determinant of matrix. |

## 4. Worked Examples (Main Focus)

### Example 1: Basic $2 \times 2$ Matrix
**Find the eigenvalues and eigenvectors of the matrix $A = \begin{bmatrix} 5 & 4 \\ 1 & 2 \end{bmatrix}$.**

**Step 1: Find the Characteristic Equation ($|A - \lambda I| = 0$)**
$$
\begin{vmatrix} 5 - \lambda & 4 \\ 1 & 2 - \lambda \end{vmatrix} = 0
$$
$$
(5 - \lambda)(2 - \lambda) - (4)(1) = 0
$$
$$
(10 - 5\lambda - 2\lambda + \lambda^2) - 4 = 0
$$
$$
\lambda^2 - 7\lambda + 6 = 0
$$

**Step 2: Solve for Eigenvalues ($\lambda$)**
Factorize the quadratic equation:
$$(\lambda - 6)(\lambda - 1) = 0$$
**Eigenvalues ($\lambda$) are $6$ and $1$.**

*(Check: Sum = $6+1=7$, Trace = $5+2=7$. Correct.)*

**Step 3: Find Eigenvectors for $\lambda = 1$**
Use $(A - \lambda I)X = 0$:
$$
\begin{bmatrix} 5-1 & 4 \\ 1 & 2-1 \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix}
$$
$$
\begin{bmatrix} 4 & 4 \\ 1 & 1 \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} = 0
$$
From row 2: $1x_1 + 1x_2 = 0 \Rightarrow x_1 = -x_2$.
Let $x_2 = k$ (any constant, usually 1). Then $x_1 = -1$.
**Eigenvector $X_1 = \begin{bmatrix} -1 \\ 1 \end{bmatrix}$**

**Step 4: Find Eigenvectors for $\lambda = 6$**
$$
\begin{bmatrix} 5-6 & 4 \\ 1 & 2-6 \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} = 0
$$
$$
\begin{bmatrix} -1 & 4 \\ 1 & -4 \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} = 0
$$
From row 2: $1x_1 - 4x_2 = 0 \Rightarrow x_1 = 4x_2$.
Let $x_2 = 1$. Then $x_1 = 4$.
**Eigenvector $X_2 = \begin{bmatrix} 4 \\ 1 \end{bmatrix}$**

---

### Example 2: Standard $3 \times 3$ Matrix (Exam Level)
**Find the eigenvalues of $A = \begin{bmatrix} 2 & 2 & 1 \\ 1 & 3 & 1 \\ 1 & 2 & 2 \end{bmatrix}$.**

**Step 1: Characteristic Equation**
$$|A - \lambda I| = 0$$
Shortcut for $3 \times 3$: $\lambda^3 - S_1 \lambda^2 + S_2 \lambda - |A| = 0$

*   $S_1 = \text{Trace} = 2 + 3 + 2 = 7$
*   $S_2 = \text{Sum of minors of diagonal elements}$
    *   $M_{11} = (3)(2) - (1)(2) = 4$
    *   $M_{22} = (2)(2) - (1)(1) = 3$
    *   $M_{33} = (2)(3) - (1)(2) = 4$
    *   $S_2 = 4 + 3 + 4 = 11$
*   $|A| = \text{Determinant}$
    *   $2(6-2) - 2(2-1) + 1(2-3) = 2(4) - 2(1) - 1 = 8 - 2 - 1 = 5$

**Equation:** $\lambda^3 - 7\lambda^2 + 11\lambda - 5 = 0$

**Step 2: Solve Cubic Equation**
*   Try $\lambda = 1$: $1 - 7 + 11 - 5 = 0$. Yes, $\lambda = 1$ is a root.
*   Use synthetic division or polynomial division to find the rest.
*   Dividing $(\lambda^3 - 7\lambda^2 + 11\lambda - 5)$ by $(\lambda - 1)$ gives $(\lambda^2 - 6\lambda + 5)$.
*   Factorize $(\lambda^2 - 6\lambda + 5) \Rightarrow (\lambda - 5)(\lambda - 1)$.

**Eigenvalues are $\lambda = 1, 1, 5$.**

**Step 3: Find Eigenvector for $\lambda = 5$**
$$[A - 5I]X = 0$$
$$
\begin{bmatrix} -3 & 2 & 1 \\ 1 & -2 & 1 \\ 1 & 2 & -3 \end{bmatrix} \begin{bmatrix} x \\ y \\ z \end{bmatrix} = 0
$$
Use Cramer’s rule (Cross-Multiplication) on first two rows:
$$ \frac{x}{(2)(1) - (1)(-2)} = \frac{-y}{(-3)(1) - (1)(1)} = \frac{z}{(-3)(-2) - (2)(1)} $$
$$ \frac{x}{4} = \frac{-y}{-4} = \frac{z}{4} \Rightarrow \frac{x}{1} = \frac{y}{1} = \frac{z}{1} $$
**Eigenvector $X_1 = \begin{bmatrix} 1 \\ 1 \\ 1 \end{bmatrix}$**

*(Note: For the repeated root $\lambda = 1$, we would substitute $\lambda=1$ and find the independent vectors).*

---

### Example 3: Properties Check
**If a matrix $A$ has eigenvalues 2, 3, and 5. Find the determinant and trace.**

*   **Trace** = Sum of eigenvalues = $2 + 3 + 5 = 10$.
*   **Determinant** = Product of eigenvalues = $2 \times 3 \times 5 = 30$.
*   **Eigenvalues of $A^2$** = $2^2, 3^2, 5^2 \Rightarrow 4, 9, 25$.
*   **Eigenvalues of $A^{-1}$** = $1/2, 1/3, 1/5$.

## 5. Real-Life / Engineering Example

1.  **Mechanical Vibrations (Resonance):**
    *   Every physical structure (bridge, building) has a "natural frequency".
    *   Mathematically, these frequencies are the **Eigenvalues** of the stiffness matrix.
    *   If wind or earthquake hits at this eigenvalue frequency, the structure resonates and breaks (like the Tacoma Narrows Bridge).

2.  **Facial Recognition (Eigenfaces):**
    *   Computers store images as huge matrices.
    *   To recognize a face, algorithms find the **Eigenvectors** (called Eigenfaces) that capture the most distinct features (nose, eyes) to reduce data size while keeping identity.

## 6. Exam-Focused Tips & Shortcuts

*   **Check your answer:** Always calculate $S_1$ (Trace) and compare it with the sum of your found $\lambda$. If they don't match, your calculation is wrong.
*   **Triangular Matrices:** If a matrix is Upper or Lower triangular, the eigenvalues are simply the **diagonal elements**. No calculation needed!
    *   Example: $A = \begin{bmatrix} 2 & 5 \\ 0 & 3 \end{bmatrix} \Rightarrow \lambda = 2, 3$.
*   **Symmetric Matrices:** If $A = A^T$, all eigenvalues are **Real** numbers (no imaginary numbers).
*   **Zero Eigenvalue:** If $|A| = 0$ (singular matrix), at least one eigenvalue is **0**.

## 7. Practice Problems

1.  Find eigenvalues and eigenvectors of $\begin{bmatrix} 4 & 2 \\ 3 & 3 \end{bmatrix}$.
2.  Find the eigenvalues of $\begin{bmatrix} 1 & 2 & 2 \\ 0 & 2 & 1 \\ -1 & 2 & 2 \end{bmatrix}$.
3.  Find the sum and product of eigenvalues for $\begin{bmatrix} 8 & -6 & 2 \\ -6 & 7 & -4 \\ 2 & -4 & 3 \end{bmatrix}$ without solving the cubic equation.
4.  Find the eigenvectors corresponding to the smallest eigenvalue of $\begin{bmatrix} 3 & 1 \\ 1 & 3 \end{bmatrix}$.
5.  If $\lambda = 2$ is an eigenvalue of $A$, what is the eigenvalue of $A^3 + 2I$?

## 8. Conclusion
Eigenvalues tell you the **magnitude** of stretch, and Eigenvectors tell you the **direction** of stretch. In exams, focus on the characteristic equation first. If you get the $\lambda$ values right, the rest of the problem is just simple substitution. Always verify using the Trace property!