import { Week, p, h, code, table, warn, key, ul, practice, lab, q } from './types';

export const week3: Week = {
  n: 3,
  title: 'Data Cleaning, EDA, Visualization',
  month: 'Month 1 · Foundations',
  emoji: '🧹',
  goal: 'Turn messy real-world data into clean data, and learn what the data is telling you.',
  daily: [
    'Day 1: Missing values and duplicates',
    'Day 2: Wrong types, text cleaning, outliers',
    'Day 3: Matplotlib and Seaborn charts',
    'Day 4: EDA step by step',
    'Day 5: Plotly and storytelling with charts',
    'Day 6: Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w3-l1',
      title: '3.1 Create a Messy Dataset',
      blocks: [
        p('Real data is dirty. Let us make dirty data so we can practice cleaning it.'),
        code`
import pandas as pd
import numpy as np

rng = np.random.default_rng(0)
n = 400
raw = pd.DataFrame({
    "customer_id": np.arange(1, n + 1),
    "age": rng.integers(18, 70, n).astype(float),
    "city": rng.choice(["Dhaka", "dhaka ", "DHAKA", "Chittagong", "Sylhet", None], n),
    "monthly_spend": rng.normal(5000, 1800, n).round(2),
    "signup_date": pd.date_range("2024-01-01", periods=n, freq="D").astype(str),
    "plan": rng.choice(["basic", "premium", "Basic", "PREMIUM"], n),
})
# Add problems on purpose
raw.loc[rng.choice(n, 30, replace=False), "age"] = np.nan
raw.loc[5, "monthly_spend"] = 90000       # outlier
raw.loc[10, "age"] = 250                  # impossible value
raw = pd.concat([raw, raw.iloc[:15]], ignore_index=True)  # duplicates
raw.to_csv("customers_raw.csv", index=False)`,
      ],
    },
    {
      id: 'w3-l2',
      title: '3.2 Missing Values',
      blocks: [
        code`
df = pd.read_csv("customers_raw.csv")

# Step 1: see how much is missing
print(df.isna().sum())
print((df.isna().mean() * 100).round(1))      # percent missing

# Step 2: choose a strategy
# a) Drop rows (only if few are missing)
df_drop = df.dropna(subset=["monthly_spend"])

# b) Fill with a number: median is safer than mean if outliers exist
df["age"] = df["age"].fillna(df["age"].median())

# c) Fill by group (smarter)
df["monthly_spend"] = df.groupby("plan")["monthly_spend"].transform(
    lambda s: s.fillna(s.median()))

# d) Fill categories with a label
df["city"] = df["city"].fillna("Unknown")`,
        key('Rule of thumb: think WHY it is missing before filling. Missing at random? Missing because the customer refused? The reason changes the best fix.'),
      ],
    },
    {
      id: 'w3-l3',
      title: '3.3 Duplicates, Types, Text Cleaning',
      blocks: [
        code`
print(df.duplicated().sum())
df = df.drop_duplicates()

# Fix types
df["signup_date"] = pd.to_datetime(df["signup_date"])
df["customer_id"] = df["customer_id"].astype(str)

# Clean text: consistent case and spaces
df["city"] = df["city"].str.strip().str.title()
df["plan"] = df["plan"].str.lower()
print(df["city"].value_counts())

# Replace values
df["plan"] = df["plan"].replace({"basic": "Basic", "premium": "Premium"})`,
      ],
    },
    {
      id: 'w3-l4',
      title: '3.4 Outliers',
      blocks: [
        code`
# Method 1: IQR rule
def iqr_bounds(s, k=1.5):
    q1, q3 = s.quantile([0.25, 0.75])
    iqr = q3 - q1
    return q1 - k * iqr, q3 + k * iqr

low, high = iqr_bounds(df["monthly_spend"])
print(df[(df["monthly_spend"] < low) | (df["monthly_spend"] > high)])

# Method 2: Z-score
z = (df["monthly_spend"] - df["monthly_spend"].mean()) / df["monthly_spend"].std()
print(df[z.abs() > 3])

# Handling: remove if it is an error, cap if it is real but extreme
df = df[df["age"].between(18, 100)]                        # impossible ages are errors
df["monthly_spend"] = df["monthly_spend"].clip(low, high)  # winsorize
df.to_csv("customers_clean.csv", index=False)`,
        warn('Decision guide: error → fix or remove. Real but extreme → keep or cap, and note it. Never delete data just because it is inconvenient.'),
      ],
    },
    {
      id: 'w3-l5',
      title: '3.5 Matplotlib and Seaborn',
      blocks: [
        code`
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid")
df = pd.read_csv("customers_clean.csv")

# Histogram: one numeric variable
fig, ax = plt.subplots(figsize=(7, 4))
sns.histplot(df["monthly_spend"], bins=30, kde=True, ax=ax)
ax.set_title("Distribution of Monthly Spend")
plt.tight_layout(); plt.savefig("hist.png", dpi=150); plt.show()

# Box plot: compare groups, see outliers
sns.boxplot(data=df, x="plan", y="monthly_spend")

# Scatter: relationship between two numbers
sns.scatterplot(data=df, x="age", y="monthly_spend", hue="plan", alpha=0.7)

# Correlation heatmap
corr = df.select_dtypes("number").corr()
sns.heatmap(corr, annot=True, cmap="coolwarm", vmin=-1, vmax=1)`,
        h('Which chart to choose'),
        table(['Question', 'Chart'], [
          ['How is one number spread?', 'Histogram, box plot'],
          ['Compare groups', 'Bar, box, violin'],
          ['Relationship of two numbers', 'Scatter'],
          ['Change over time', 'Line'],
          ['Parts of a whole (few parts)', 'Bar (avoid pie with many parts)'],
          ['Many numbers together', 'Heatmap, pair plot'],
        ]),
      ],
    },
    {
      id: 'w3-l6',
      title: '3.6 EDA: A Repeatable Checklist',
      blocks: [
        code`
def quick_eda(df, target=None):
    print("Shape:", df.shape)
    print("\nTypes:\n", df.dtypes)
    print("\nMissing %:\n", (df.isna().mean() * 100).round(1))
    print("\nDuplicates:", df.duplicated().sum())
    print("\nNumeric summary:\n", df.describe().T)
    for col in df.select_dtypes("object"):
        print(f"\n{col} (unique={df[col].nunique()}):")
        print(df[col].value_counts().head(5))
    if target and target in df:
        print(df.select_dtypes("number").corr()[target].sort_values())

quick_eda(df, target="monthly_spend")`,
        h('EDA questions to ask'),
        ul('What does each row represent? What does each column mean?', 'What are the ranges, averages, and shapes of each variable?', 'What is missing, and why?', 'What looks wrong? What looks surprising?', 'Which variables relate to my target?', 'What would I do next?'),
      ],
    },
    {
      id: 'w3-l7',
      title: '3.7–3.8 Plotly and Good Chart Habits',
      blocks: [
        code`
import plotly.express as px

fig = px.scatter(df, x="age", y="monthly_spend", color="plan",
                 hover_data=["city"], title="Age vs Spend")
fig.show()
fig.write_html("scatter.html")`,
        h('Good chart habits'),
        ul('One message per chart. Put the message in the title.', 'Label axes with units.', 'Start bar charts at zero.', 'Use few colors, with meaning.', 'Remove clutter. Make text readable.'),
        h('Try it: Central Limit Theorem — shapes appear from chaos'),
        lab('clt'),
        practice('Notice how a very skewed population still gives a bell-shaped histogram of sample means. This is a preview of Week 4.'),
      ],
    },
  ],
  exercises: [
    'Write a clean_data(df) function that does all cleaning steps and returns a clean frame. Test it on customers_raw.csv.',
    'Find the 3 variables most related to monthly_spend and explain why.',
    'Build a one-page dashboard with 4 charts in one figure.',
    'Find a free CSV online (e.g. your country\'s open data portal), clean it, and write 5 insights.',
  ],
  project: {
    title: 'Mini Project 3: Clean and Explore a Real Dataset',
    desc: 'Choose one dataset (shop sales, a Kaggle dataset, or open government data). Deliver a notebook with: data description, cleaning log (what you changed and why), 8 charts, and 5 written insights. Publish on GitHub.',
  },
  checklist: [
    'I handle missing values with a reason',
    'I detect outliers by IQR and z-score',
    'I pick the right chart for the question',
    'I have a repeatable EDA routine',
  ],
  quiz: [
    q('When data has outliers, which fill value is generally safer for missing numbers?', ['Mean', 'Median', 'Maximum', 'Zero'], 1, 'The median is robust to outliers; the mean gets pulled by them.'),
    q('What does the IQR rule flag as outliers?', ['Values beyond Q1 − 1.5·IQR or Q3 + 1.5·IQR', 'Values above the mean', 'Values below zero', 'The top 1% only'], 0, 'The IQR rule uses 1.5 × IQR beyond the quartiles.'),
    q('A customer age of 250 is found. What is the best action?', ['Cap it at the 95th percentile', 'Treat it as an error: fix or remove', 'Keep it, it is real', 'Replace with 0'], 1, 'Impossible values are data errors, so fix or remove them.'),
    q('Which chart best shows change over time?', ['Pie chart', 'Line chart', 'Histogram', 'Heatmap'], 1, 'Line charts show trends over time.'),
    q('"Dhaka", "dhaka " and "DHAKA" should be cleaned with:', ['df.city.str.strip().str.title()', 'df.dropna()', 'df.clip()', 'df.astype(int)'], 0, 'Strip spaces and normalize case to merge variants.'),
    q('Bar charts should usually:', ['Use a log scale', 'Start at zero', 'Use 3D effects', 'Have many colors'], 1, 'A non-zero baseline exaggerates differences.'),
  ],
};

export const week4: Week = {
  n: 4,
  title: 'SQL, Statistics, Probability',
  month: 'Month 1 · Foundations',
  emoji: '📊',
  goal: 'Get data from databases, and use statistics to make sound decisions instead of guesses.',
  daily: [
    'Day 1: SQL basics: SELECT, WHERE, ORDER BY',
    'Day 2: SQL aggregation, JOIN, subqueries',
    'Day 3: Window functions, CTEs, SQL from Python',
    'Day 4: Descriptive statistics, probability, distributions',
    'Day 5: Sampling, confidence intervals, hypothesis testing',
    'Day 6: Correlation, A/B test + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w4-l1',
      title: '4.1 SQL Practice Setup (SQLite)',
      blocks: [
        code`
import sqlite3
import pandas as pd
import numpy as np

rng = np.random.default_rng(1)
conn = sqlite3.connect("shop.db")

customers = pd.DataFrame({
    "customer_id": range(1, 101),
    "name": [f"Customer {i}" for i in range(1, 101)],
    "city": rng.choice(["Dhaka", "Chittagong", "Sylhet"], 100),
})
orders = pd.DataFrame({
    "order_id": range(1, 801),
    "customer_id": rng.integers(1, 101, 800),
    "order_date": pd.date_range("2025-01-01", periods=800, freq="12h").astype(str),
    "amount": rng.gamma(2, 600, 800).round(2),
})
customers.to_sql("customers", conn, if_exists="replace", index=False)
orders.to_sql("orders", conn, if_exists="replace", index=False)

def q(sql):
    return pd.read_sql(sql, conn)`,
      ],
    },
    {
      id: 'w4-l2',
      title: '4.2 SQL Fundamentals',
      blocks: [
        code`
# SELECT, WHERE, ORDER BY, LIMIT
print(q("""
SELECT order_id, customer_id, amount
FROM orders
WHERE amount > 2000
ORDER BY amount DESC
LIMIT 5
"""))

# Aggregation: GROUP BY and HAVING
print(q("""
SELECT customer_id, COUNT(*) AS n_orders, SUM(amount) AS total
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= 10
ORDER BY total DESC
"""))

# JOIN
print(q("""
SELECT c.city, COUNT(*) AS orders, ROUND(SUM(o.amount),0) AS revenue
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
GROUP BY c.city
ORDER BY revenue DESC
"""))

# LEFT JOIN: find customers with NO orders
print(q("""
SELECT c.customer_id, c.name
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL
"""))`,
        key('Writing order: SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT'),
      ],
    },
    {
      id: 'w4-l3',
      title: '4.3 CTEs and Window Functions',
      blocks: [
        p('Asked in many interviews. Learn them well.'),
        code`
# CTE: a named temporary result, makes SQL readable
print(q("""
WITH monthly AS (
    SELECT substr(order_date, 1, 7) AS month, SUM(amount) AS revenue
    FROM orders
    GROUP BY month
)
SELECT month, revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev_month,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly
"""))

# RANK within groups: top 2 orders per city
print(q("""
SELECT * FROM (
    SELECT c.city, o.order_id, o.amount,
           RANK() OVER (PARTITION BY c.city ORDER BY o.amount DESC) AS rnk
    FROM orders o JOIN customers c USING (customer_id)
)
WHERE rnk <= 2
"""))

# Running total
print(q("""
SELECT order_id, amount,
       SUM(amount) OVER (ORDER BY order_id) AS running_total
FROM orders LIMIT 5
"""))`,
        practice('Write 10 queries: top 10 customers, orders per month, average order by city, customers with more than 8 orders, second highest order per city, month-over-month growth, and more.'),
      ],
    },
    {
      id: 'w4-l4',
      title: '4.4 Descriptive Statistics',
      blocks: [
        code`
import numpy as np, pandas as pd
from scipy import stats

x = np.array([12, 15, 14, 10, 18, 20, 15, 14, 100])
print("Mean:", x.mean())               # pulled by the outlier
print("Median:", np.median(x))         # robust
print("Std dev:", x.std(ddof=1))       # ddof=1 for a sample
print("IQR:", stats.iqr(x))
print("Skew:", stats.skew(x), " Kurtosis:", stats.kurtosis(x))`,
        key('Mean is sensitive to outliers; median is not. Report both for skewed data (income, prices).'),
      ],
    },
    {
      id: 'w4-l5',
      title: '4.5 Probability Basics',
      blocks: [
        code`
rng = np.random.default_rng(42)

# P(sum of two dice = 7)  -> exact answer 6/36 = 0.1667
rolls = rng.integers(1, 7, (100000, 2)).sum(axis=1)
print((rolls == 7).mean())

# Bayes rule: P(A|B) = P(B|A) * P(A) / P(B)
# Disease affects 1%. Test is 95% sensitive, 90% specific.
p_d = 0.01
sens, spec = 0.95, 0.90
p_pos = sens * p_d + (1 - spec) * (1 - p_d)
print("P(disease | positive) =", round(sens * p_d / p_pos, 3))   # about 0.088!`,
        p('That result surprises most people. It is why **base rates** matter in fraud detection, medical tests, and spam filters. Play with it:'),
        lab('bayes'),
      ],
    },
    {
      id: 'w4-l6',
      title: '4.6 Distributions',
      blocks: [
        code`
from scipy import stats

print(stats.norm.cdf(1.96))            # 0.975
print(stats.norm.ppf(0.975))           # 1.96
print(stats.binom.pmf(k=3, n=10, p=0.5))
print(stats.poisson.pmf(k=5, mu=3))

# Central Limit Theorem: means of samples look normal
rng = np.random.default_rng(0)
population = rng.exponential(scale=2, size=100000)       # very skewed
sample_means = [rng.choice(population, 50).mean() for _ in range(2000)]`,
        table(['Distribution', 'Use'], [
          ['Normal', 'Natural measurements, errors'],
          ['Binomial', 'Yes/no repeated trials'],
          ['Poisson', 'Events in a fixed time'],
          ['Exponential', 'Time between events'],
          ['Uniform', 'All outcomes equal'],
        ]),
      ],
    },
    {
      id: 'w4-l7',
      title: '4.7 Confidence Intervals and Hypothesis Tests',
      blocks: [
        code`
rng = np.random.default_rng(3)
sample = rng.normal(52, 10, 40)

# 95% confidence interval for the mean
mean = sample.mean()
se = stats.sem(sample)
ci = stats.t.interval(0.95, df=len(sample) - 1, loc=mean, scale=se)

# One-sample t-test: is the true mean different from 50?
t, p = stats.ttest_1samp(sample, 50)

# Two-sample t-test: do two groups differ?
a = rng.normal(100, 15, 60)
b = rng.normal(108, 15, 60)
t, p = stats.ttest_ind(a, b, equal_var=False)

# Chi-square: are two categories related?
table = np.array([[30, 20], [15, 35]])
chi2, p, dof, exp = stats.chi2_contingency(table)

# Correlation
r, p = stats.pearsonr(x, y)`,
        key('How to read a p-value: if there were truly no effect, how often would we see data this extreme by chance? A small p (usually below 0.05) is evidence against "no effect". It does NOT tell you the effect is large or important. Report the effect size and confidence interval too.'),
        warn('Common mistakes: correlation is not causation · p-hacking (reporting only "significant" results) · tiny samples · thinking "not significant" means "no effect".'),
      ],
    },
    {
      id: 'w4-l8',
      title: '4.8 A/B Test Example',
      blocks: [
        code`
# Version A: 120 buyers out of 1000. Version B: 150 of 1000.
from statsmodels.stats.proportion import proportions_ztest, proportion_confint

counts = np.array([120, 150])
nobs = np.array([1000, 1000])
z, p = proportions_ztest(counts, nobs)
print("z =", round(z, 2), "p =", round(p, 4))
print("A rate CI:", proportion_confint(120, 1000))
print("B rate CI:", proportion_confint(150, 1000))`,
      ],
    },
  ],
  exercises: [
    'Write 15 SQL queries on shop.db (5 easy, 5 with JOIN/GROUP BY, 5 with window functions).',
    'Simulate 10,000 coin-flip experiments of 100 flips. Plot the distribution of heads.',
    'Test whether Dhaka customers spend more than Sylhet customers (ttest_ind). Explain the result in plain words.',
    'Compute a bootstrap confidence interval for the median order amount (resample 5000 times).',
  ],
  project: {
    title: 'Mini Project 4: Business Questions with SQL and Statistics',
    desc: 'Answer 6 business questions using SQL (get data) + Python statistics (test it). Example: "Are weekend orders larger than weekday orders?" Write each answer as a short paragraph a manager can read.',
  },
  checklist: [
    'I can write JOINs, GROUP BY, CTEs, and window functions',
    'I can explain mean vs median, standard deviation, and the CLT',
    'I can run and interpret a t-test, chi-square, and confidence interval',
    'I understand p-values and their limits',
  ],
  quiz: [
    q('What is the difference between WHERE and HAVING?', ['No difference', 'WHERE filters rows before grouping, HAVING filters groups after', 'HAVING is faster', 'WHERE works only with JOIN'], 1, 'WHERE filters raw rows; HAVING filters aggregated groups.'),
    q('Which query finds customers with NO orders?', ['INNER JOIN', 'LEFT JOIN ... WHERE o.order_id IS NULL', 'GROUP BY ... HAVING', 'UNION ALL'], 1, 'LEFT JOIN keeps all customers; NULL on the order side means no order.'),
    q('For skewed data like income, which summary is more robust?', ['Mean', 'Median', 'Sum', 'Variance'], 1, 'The median is not pulled by extreme values.'),
    q('A disease affects 1% of people; the test is 95% sensitive and 90% specific. P(disease | positive) is about…', ['95%', '90%', '9%', '50%'], 2, 'By Bayes rule ≈ 0.088 — the low base rate dominates.'),
    q('The Central Limit Theorem says:', ['All data are normal', 'Means of many samples tend toward a normal distribution', 'Medians are always equal to means', 'Large samples have no variance'], 1, 'Sample means look normal even if the population is skewed.'),
    q('A p-value of 0.03 means:', ['3% chance the null is true', 'If there were no effect, data this extreme would happen ~3% of the time', 'The effect is large', 'The result is certainly causal'], 1, 'It is the probability of data this extreme assuming no effect.'),
  ],
};
