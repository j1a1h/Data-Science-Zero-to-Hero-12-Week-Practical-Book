import { Week, p, h, code, tip, key, practice, q } from './types';

export const week1: Week = {
  n: 1,
  title: 'Python for Data Science',
  month: 'Month 1 · Foundations',
  emoji: '🐍',
  goal: 'Write clean, useful Python. You know the basics, so this week makes them strong and data-focused.',
  daily: [
    'Day 1: Variables, types, strings, f-strings',
    'Day 2: Lists, tuples, sets, dictionaries',
    'Day 3: Control flow, loops, comprehensions',
    'Day 4: Functions, lambda, error handling',
    'Day 5: Files, JSON, CSV, modules',
    'Day 6: OOP basics + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w1-l1',
      title: '1.1 Variables, Types, Strings',
      blocks: [
        code`
name = "Jahid"          # str
age = 25                # int
height = 1.72           # float
is_student = True       # bool

print(type(name), type(age), type(height), type(is_student))

# f-strings: the best way to format text
print(f"{name} is {age} years old and {height:.1f} m tall")

# Useful string methods
text = "  Data Science is Fun  "
print(text.strip())            # remove spaces at the ends
print(text.lower())
print(text.strip().split())    # ['Data', 'Science', 'is', 'Fun']
print("-".join(["a", "b", "c"]))  # a-b-c
print("Data" in text)          # True`,
        practice('Take the sentence "python is great for data science". Print it in Title Case, count the words, and count how many times the letter a appears.'),
      ],
    },
    {
      id: 'w1-l2',
      title: '1.2 Collections',
      blocks: [
        code`
# List: ordered, changeable
prices = [120, 85, 40, 200, 85]
prices.append(60)
print(prices[0], prices[-1], prices[1:4])
print(sorted(prices), sum(prices), len(prices))

# Tuple: ordered, NOT changeable
point = (23.8, 90.4)

# Set: unique items only
unique_prices = set(prices)

# Dictionary: key -> value
product = {"name": "Rice", "price": 60, "stock": 120}
print(product["name"], product.get("color", "unknown"))
product["price"] = 65
for key, value in product.items():
    print(key, "=", value)

# List of dictionaries: very common in data science
sales = [
    {"item": "Rice", "qty": 5, "price": 60},
    {"item": "Oil", "qty": 2, "price": 180},
    {"item": "Sugar", "qty": 3, "price": 120},
]
total = sum(s["qty"] * s["price"] for s in sales)
print("Total:", total)`,
        tip('A list of dictionaries is exactly how JSON from an API looks — and it converts directly into a Pandas DataFrame.'),
      ],
    },
    {
      id: 'w1-l3',
      title: '1.3 Control Flow and Comprehensions',
      blocks: [
        code`
score = 78
if score >= 80:
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "C"

# for loop with enumerate and zip
names = ["Ana", "Ben", "Cara"]
marks = [90, 72, 85]
for i, (n, m) in enumerate(zip(names, marks), start=1):
    print(i, n, m)

# List comprehension: short and fast
squares = [x**2 for x in range(1, 6)]
even_squares = [x**2 for x in range(1, 11) if x % 2 == 0]

# Dictionary comprehension
price_map = {s["item"]: s["price"] for s in sales}

# while loop
n = 0
while n < 3:
    print("n is", n)
    n += 1`,
      ],
    },
    {
      id: 'w1-l4',
      title: '1.4 Functions and Error Handling',
      blocks: [
        code`
def average(numbers):
    """Return the mean of a list of numbers."""
    if not numbers:
        raise ValueError("The list is empty")
    return sum(numbers) / len(numbers)

# Default and keyword arguments
def discount(price, percent=10):
    return price * (1 - percent / 100)

print(discount(200), discount(200, percent=25))

# Lambda and sorting
items = [("Rice", 60), ("Oil", 180), ("Salt", 20)]
print(sorted(items, key=lambda x: x[1], reverse=True))

# map and filter
nums = [1, 2, 3, 4, 5]
print(list(map(lambda x: x * 2, nums)))
print(list(filter(lambda x: x > 2, nums)))

# try / except
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
    finally:
        pass  # runs always`,
      ],
    },
    {
      id: 'w1-l5',
      title: '1.5 Files, JSON, CSV',
      blocks: [
        code`
import json, csv

with open("notes.txt", "w") as f:
    f.write("Hello data science\n")
with open("notes.txt") as f:
    print(f.read())

# JSON
data = {"name": "Rice", "price": 60, "tags": ["food", "staple"]}
with open("item.json", "w") as f:
    json.dump(data, f, indent=2)
with open("item.json") as f:
    loaded = json.load(f)

# CSV
rows = [["item", "qty"], ["Rice", 5], ["Oil", 2]]
with open("sales.csv", "w", newline="") as f:
    csv.writer(f).writerows(rows)
with open("sales.csv") as f:
    for row in csv.DictReader(f):
        print(row)`,
      ],
    },
    {
      id: 'w1-l6',
      title: '1.6 OOP Basics + 1.7 Standard Tools',
      blocks: [
        code`
class Product:
    def __init__(self, name, price, stock):
        self.name = name
        self.price = price
        self.stock = stock

    def sell(self, qty):
        if qty > self.stock:
            raise ValueError("Not enough stock")
        self.stock -= qty
        return qty * self.price

    def __repr__(self):
        return f"Product({self.name}, price={self.price}, stock={self.stock})"

rice = Product("Rice", 60, 100)
print(rice.sell(10), rice)`,
        h('Useful standard-library tools'),
        code`
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import random, math

words = "to be or not to be".split()
print(Counter(words).most_common(2))

groups = defaultdict(list)
for w in words:
    groups[len(w)].append(w)

now = datetime.now()
print(now.strftime("%Y-%m-%d"), now + timedelta(days=7))

random.seed(42)
print(random.randint(1, 100), math.sqrt(16))`,
      ],
    },
  ],
  exercises: [
    'Write is_palindrome(text) that ignores spaces and capital letters.',
    'Write a function that takes a list of numbers and returns min, max, mean, and median without using NumPy.',
    'Given a list of sentences, build a word-frequency dictionary and print the top 5 words.',
    'Read a CSV file you create and calculate the total of one column.',
    'Write a class BankAccount with deposit, withdraw, and a check for negative balance.',
  ],
  project: {
    title: 'Mini Project 1: Shop Sales Tracker',
    desc: 'Build a command-line program that stores items (name, price, stock) in a JSON file, lets you record a sale and reduces stock, and prints a daily report: total sales, best-selling item, low-stock items.',
    skills: 'dictionaries, functions, files, JSON, error handling. Push to GitHub with a README.',
  },
  checklist: [
    'I can write functions with default arguments',
    'I can use list and dictionary comprehensions',
    'I can read and write CSV and JSON',
    'I handle errors with try/except',
    'Project 1 is on GitHub',
  ],
  quiz: [
    q('Which is the best way to format text with variables in modern Python?', ['% operator', 'f-strings', 'String concatenation with +', 'str.join only'], 1, 'f-strings are readable, fast, and support format specs like {height:.1f}.'),
    q('What is the main difference between a list and a tuple?', ['Lists are ordered, tuples are not', 'Tuples cannot be changed after creation', 'Lists cannot hold numbers', 'Tuples are always faster to print'], 1, 'Tuples are immutable — you cannot change their items. Both are ordered.'),
    q('What does [x**2 for x in range(1, 11) if x % 2 == 0] return?', ['[1, 9, 25, 49, 81]', '[4, 16, 36, 64, 100]', '[2, 4, 6, 8, 10]', '[4, 16, 36, 64, 100, 144]'], 1, 'Only even x (2,4,6,8,10) are kept, then squared.'),
    q('What does dict.get("color", "unknown") do when "color" is missing?', ['Raises KeyError', 'Returns None', 'Returns "unknown"', 'Adds the key'], 2, '.get returns the default value instead of raising an error.'),
    q('In a try/except/finally block, when does finally run?', ['Only when an error occurs', 'Only when no error occurs', 'Always', 'Never if there is a return'], 2, 'finally always runs — even with a return in try or except.'),
    q('Why use `with open(...) as f`?', ['It makes reading faster', 'It closes the file automatically', 'It is required for CSV', 'It encrypts the file'], 1, 'The context manager closes the file even if an error happens.'),
  ],
};

export const week2: Week = {
  n: 2,
  title: 'NumPy and Pandas',
  month: 'Month 1 · Foundations',
  emoji: '🐼',
  goal: 'Handle tables of data like a professional. Pandas is the tool you will use every day.',
  daily: [
    'Day 1: NumPy arrays and math',
    'Day 2: NumPy indexing, broadcasting, random',
    'Day 3: Pandas Series and DataFrame, reading data',
    'Day 4: Selecting, filtering, sorting',
    'Day 5: groupby, merge, pivot',
    'Day 6: Dates, strings, apply + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w2-l1',
      title: '2.1 NumPy Basics',
      blocks: [
        p('Why NumPy? It is **10 to 100 times faster** than Python lists for numbers, and every ML library is built on it.'),
        code`
import numpy as np

a = np.array([1, 2, 3, 4, 5])
b = np.array([[1, 2, 3], [4, 5, 6]])
print(a.shape, b.shape, b.ndim, b.dtype)

print(np.zeros((2, 3)))
print(np.arange(0, 10, 2))
print(np.linspace(0, 1, 5))
print(np.eye(3))

# Vector math: no loops needed
print(a * 2, a + 10, a ** 2)
print(a.mean(), a.std(), a.sum(), a.min(), a.max())

# Axis: 0 = down the rows (per column), 1 = across the columns (per row)
print(b.sum(axis=0), b.sum(axis=1))`,
      ],
    },
    {
      id: 'w2-l2',
      title: '2.2 Indexing, Broadcasting, Random',
      blocks: [
        code`
m = np.arange(12).reshape(3, 4)
print(m[0, 1], m[:, 2], m[1:, :2])

# Boolean masks: filter without loops
x = np.array([5, 12, 7, 20, 3])
print(x[x > 6])
print(np.where(x > 6, "big", "small"))

# Broadcasting: shapes are stretched automatically
prices = np.array([[100, 200], [150, 250]])
tax = np.array([0.05, 0.10])
print(prices * (1 + tax))

# Random numbers (always set a seed)
rng = np.random.default_rng(42)
print(rng.normal(loc=0, scale=1, size=5))
print(rng.integers(1, 7, size=10))   # dice rolls

# Linear algebra
A = np.array([[2, 1], [1, 3]])
v = np.array([1, 2])
print(A @ v, np.linalg.inv(A))`,
        practice('Create 1000 random heights (mean 170, std 10). Find how many are above 185 and the 90th percentile using np.percentile.'),
      ],
    },
    {
      id: 'w2-l3',
      title: '2.3 Pandas: Series and DataFrame',
      blocks: [
        code`
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "item": ["Rice", "Oil", "Sugar", "Salt", "Tea"],
    "category": ["Grain", "Oil", "Sweet", "Spice", "Drink"],
    "price": [60, 180, 120, 20, 90],
    "qty": [10, 4, 6, 15, 8],
})
df["revenue"] = df["price"] * df["qty"]

# First look at ANY dataset: do these every time
print(df.head())
print(df.shape)
df.info()
print(df.describe())
print(df.isna().sum())

df.to_csv("shop.csv", index=False)
df2 = pd.read_csv("shop.csv")`,
        key('First look routine: head, shape, info, describe, isna. Do it on every dataset, every time.'),
      ],
    },
    {
      id: 'w2-l4',
      title: '2.4 Selecting, Filtering, Sorting',
      blocks: [
        code`
print(df[["item", "price"]])

# loc = by label, iloc = by position
print(df.loc[1:3, ["item", "price"]])
print(df.iloc[0:2, 0:2])

# Filtering (use & | ~ and wrap each condition in brackets)
print(df[df["price"] > 80])
print(df[(df["price"] > 50) & (df["qty"] > 5)])
print(df[df["category"].isin(["Grain", "Drink"])])
print(df.query("price > 50 and qty < 10"))

# Sorting
print(df.sort_values("revenue", ascending=False))
print(df.nlargest(3, "revenue"))

# Rename, drop, new columns
df = df.rename(columns={"qty": "quantity"})
df = df.drop(columns=["category"])
df["expensive"] = np.where(df["price"] > 100, "yes", "no")`,
      ],
    },
    {
      id: 'w2-l5',
      title: '2.5 groupby, merge, pivot',
      blocks: [
        code`
rng = np.random.default_rng(42)
n = 500
sales = pd.DataFrame({
    "date": pd.date_range("2025-01-01", periods=n, freq="D"),
    "item": rng.choice(["Rice", "Oil", "Sugar", "Salt", "Tea"], n),
    "customer_id": rng.integers(1, 80, n),
    "qty": rng.integers(1, 10, n),
})
price_table = pd.DataFrame({
    "item": ["Rice", "Oil", "Sugar", "Salt", "Tea"],
    "price": [60, 180, 120, 20, 90],
    "category": ["Grain", "Oil", "Sweet", "Spice", "Drink"],
})

# merge = SQL JOIN
data = sales.merge(price_table, on="item", how="left")
data["revenue"] = data["qty"] * data["price"]

# groupby: split, apply, combine
print(data.groupby("item")["revenue"].sum())
print(data.groupby("category").agg(
    total_revenue=("revenue", "sum"),
    avg_qty=("qty", "mean"),
    orders=("item", "count"),
))

# Pivot table
data["month"] = data["date"].dt.to_period("M")
pivot = data.pivot_table(index="month", columns="item",
                         values="revenue", aggfunc="sum", fill_value=0)

print(data["item"].value_counts())
print(pd.crosstab(data["category"], data["qty"] > 5))`,
      ],
    },
    {
      id: 'w2-l6',
      title: '2.6 Dates, Strings, apply',
      blocks: [
        code`
data["year"] = data["date"].dt.year
data["weekday"] = data["date"].dt.day_name()
data["is_weekend"] = data["date"].dt.dayofweek >= 5
monthly = data.set_index("date").resample("ME")["revenue"].sum()

names = pd.Series([" Ali Khan ", "sara AHMED", "Tom lee"])
print(names.str.strip().str.title())
print(names.str.contains("ali", case=False))

# apply (use only if there is no vectorized way)
def bucket(r):
    if r < 200: return "low"
    if r < 600: return "medium"
    return "high"
data["revenue_level"] = data["revenue"].apply(bucket)

# Rolling and cumulative
daily = data.groupby("date")["revenue"].sum()
print(daily.rolling(7).mean().head(10))
print(daily.cumsum().tail())`,
      ],
    },
  ],
  exercises: [
    'From data, find the top 3 customers by total revenue.',
    'Find which weekday has the highest average revenue.',
    'Find the month with the lowest sales for each item.',
    'Add a column rank_in_category using groupby().rank().',
    'Create a DataFrame of 1000 random students with marks and find the average mark per grade group.',
  ],
  project: {
    title: 'Mini Project 2: Shop Sales Analysis',
    desc: 'Using the generated sales data (or real shop data): total revenue by month and by item, best and worst days, a customer table (total spent, number of visits, last visit). Save a clean CSV and write 5 insights in a README.',
  },
  checklist: [
    'I use vectorized NumPy operations instead of loops',
    'I can filter, group, merge, and pivot in Pandas',
    'I can work with dates and strings',
    'I do a first-look (head, info, describe, isna) on every dataset',
  ],
  quiz: [
    q('What does b.sum(axis=0) do for a 2D array b?', ['Sums each row', 'Sums each column', 'Sums all numbers', 'Sums the diagonal'], 1, 'axis=0 goes down the rows, giving one result per column.'),
    q('What is broadcasting in NumPy?', ['Sending data over a network', 'Automatically stretching array shapes for math', 'Printing an array', 'Copying an array'], 1, 'Smaller arrays are stretched so shapes match, e.g. prices * (1 + tax).'),
    q('Which is the correct way to filter rows where price > 50 AND qty > 5?', ['df[df.price > 50 and df.qty > 5]', 'df[(df.price > 50) & (df.qty > 5)]', 'df[df.price > 50 & df.qty > 5]', 'df.filter(price > 50, qty > 5)'], 1, 'Use & with brackets around every condition. "and" does not work on Series.'),
    q('Difference between loc and iloc?', ['loc is by label, iloc is by position', 'loc is faster', 'iloc is for columns only', 'No difference'], 0, 'loc selects by label/name, iloc by integer position.'),
    q('Pandas merge is most similar to which SQL operation?', ['GROUP BY', 'ORDER BY', 'JOIN', 'LIMIT'], 2, 'merge(on=..., how="left") is a SQL JOIN.'),
    q('Why set a seed with np.random.default_rng(42)?', ['Faster random numbers', 'Repeatable results', 'More random numbers', 'Required by Pandas'], 1, 'A seed makes random results reproducible.'),
  ],
};
