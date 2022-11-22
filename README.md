# Lab08 - Quiz

[TOC]

## Due Date

Week 9 Monday 5:00 pm AEST

## Background

### Rationale

Now that we've learned how to use `jest --coverage` ...
- **Question**: is it possible to measure the code of our express server this way?
- **Answer**: No, no, no (we don't talk about Bruno ~).

Unfortunately, our test with jest, which utilises [sync-request](https://www.npmjs.com/package/sync-request), is only making HTTP requests to a server at a certain URL address. Visually, this looks like

<div align="center">

```
+----------------+                               +----------------+
|                |   >>>>  HTTP Requests  >>>>   |                |
|   Jest tests   |                               | Express server |
|                |   <<<<  HTTP Response  <<<<   |                |
+----------------+                               +----------------+
```

</div>

This means that Jest does not know about the implementation of our server (only what comes in and out) and thus cannot measure coverage directly.

So... how can we measure the code coverage of our server? You guessed it, it's by directly measuring coverage when running the server itself - we can do this with a nifty tool called [nyc](https://www.npmjs.com/package/nyc)!

In addition to measuring our server code coverage, we will also be throwing HTTPErrors and utilising COMP1531's custom middleware for error handling in this lab. Many questions, and many more answers to come!

### Getting Started
- Please ensure that you have completed lab08_objection prior.
- Copy the SSH clone link from Gitlab and clone this repository on either VLAB or your local machine. 
- In your terminal, change your directory (using the `cd` command) into the newly cloned lab.

### Package Installation

1. Open [package.json](package.json) and look at existing packages in `"dependencies"` and `"devDependencies"`. Install them with:
    ```shell
    $ npm install
    ```

1. Install [http-errors](https://www.npmjs.com/package/http-errors) and COMP1531's custom [middleware-http-errors](https://www.npmjs.com/package/middleware-http-errors):
    ```shell
    $ npm install http-errors middleware-http-errors
    ```

1. Install [nyc](https://www.npmjs.com/package/nyc) and the type definitions [@types/http-errors](https://www.npmjs.com/package/@types/http-errors) as development dependencies:
    ```shell
    $ npm install --save-dev nyc @types/http-errors
    ```

1. Open your [package.json](package.json) and add the following scripts:
    ```json
    "scripts": {
        "ts-node": "ts-node",
        "ts-node-coverage": "nyc --reporter=text --reporter=lcov ts-node",
        "test": "jest src",
        "tsc": "tsc --noEmit",
        "lint": "eslint src/**.ts"
        // Any other scripts you want here
    }
    ```

1. Notice in the `ts-node-coverage` script we have added `nyc --reporter=text --reporter=lcov` before running `ts-node`:
    - `nyc` - to measure our server code coverage.
    - `--reporter=text` - display coverage results to the terminal when the server closes.
    - `--reporter=lcov` - also generates a `coverage/lcov-report/index.html` file for us to open in our browser.
    - Further instructions on server coverage can be found in the [Testing](#testing) section.

1. To check that you have completed the steps correctly, compare your [package.json](package.json) with our sample package.json in the [Additional Information](#additional-information) section.

1. (Optional) Update [.gitlab-ci.yml](.gitlab-ci.yml) with testing and linting.

1. (Optional) Bonus Tips: you may find the following scripts which incorporate [nodemon](https://www.npmjs.com/package//nodemon) helpful:
    ```json
    "start": "nodemon src/server.ts",
    "coverage-start": "nyc --reporter=text --reporter=lcov nodemon src/server.ts",
    ```

### Interface: Routes

<table>
  <tr>
    <th>Name & Description</th>
    <th>HTTP Method</th>
    <th>Data Types</th>
    <th>Errors</th>
  </tr>
  <tr>
    <td>
        <code>/</code><br /><br />
        This is an example route that we will implement for you.
        <br/><br/>
        Display a message when the root url of the server is accessed directly.
    </td>
    <td>
        GET
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{message}</code>
    </td>
    <td>
        N/A
    </td>
  </tr>
  <tr>
    <td>
        <code>/echo/echo</code><br/><br/>
        This is an example route that we will implement for you.
        <br/><br/>
        Echoes the given message back to the caller.
    </td>
    <td>
        GET
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{message}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{message}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when the message passed in is exactly <code>echo</code>.
    </td>
  </tr>
  <tr>
    <td>
        <code>/quiz/create</code><br/><br/>
        Create a quiz and return its corresponding id.
    </td>
    <td>
        POST
    </td>
    <td>
        <b>Body Parameters</b><br/>
        <code>{quizTitle, quizSynopsis}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{quizId}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizTitle is an empty string, <code>""</code></li>
            <li>quizSynopsis is an empty string <code>""</code></li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/quiz/details</code><br/><br/>
        Get the full details about a quiz
    </td>
    <td>
        GET
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{quizId}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{quiz}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/quiz/edit</code><br /><br />
        Edit a quiz
    </td>
    <td>
        PUT
    </td>
    <td>
        <b>Body Parameters</b><br/>
        <code>{quizId, quizTitle, quizSynopsis}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
            <li>quizTitle is an empty string, <code>""</code></li>
            <li>quizSynopsis is an empty string <code>""</code></li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/quiz/remove</code><br/><br/>
        Remove a quiz
    </td>
    <td>
        DELETE
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{quizId}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/quizzes/list</code><br/><br/>
        Get brief details about all quizzes, in the order that they were created.
        <br/><br/>
        For example, if we create <code>q1</code>, <code>q2</code> and <code>q3</code>, the returned order is
        <code>[q1, q2, q3]</code>.
    </td>
    <td>
        GET
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{quizzes}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/question/add</code><br/><br/>
        Add a question to a quiz
    </td>
    <td>
        POST
    </td>
    <td>
        <b>Body Parameters</b><br/>
        <code>{quizId, questionString, questionType, answers}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{questionId}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
            <li>questionString is an empty string <code>""</code></li>
            <li>questionType is not either "single" or "multiple"
            <li>the questionType is "single" and there is not exactly 1 correct answer</li>
            <li>there are no correct answers</li>
            <li>any of the <code>answerString</code> is an empty string, <code>""</code></li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/question/edit</code><br/><br/>
        Edits a question
    </td>
    <td>
        POST
    </td>
    <td>
        <b>Body Parameters</b><br/>
        <code>{questionId, questionString, questionType, answers}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>questionId does not refer to a valid question
            <li>questionString is an empty string <code>""</code></li>
            <li>questionType is not either "single" or "multiple"
            <li>the questionType is "single" and there is not exactly 1 correct answer</li>
            <li>there are no correct answers</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/question/remove</code><br/><br/>
        Remove a question
    </td>
    <td>
        DELETE
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{questionId}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>questionId does not refer to a valid question
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/clear</code><br/><br/>
        Clear all data.
    </td>
    <td>
        DELETE
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        N/A
    </td>
  </tr>
</table>

#### Notes:

1. The `answers` for each question, when returned, should be in the same order they were given.
1. IDs should always be unique. When a quiz or question is deleted, their IDs should not be re-used.
1. For arrays of objects, they should be returned in the order the objects were created, similar to the example given in `/quizzes/list`.

### Interface: Data Types

| Variable Name | Type |
| --- | --- |
| contains prefix **is** | `boolean` |
| contains suffix **Id** | `number` |
| contains suffix **String** | `string` |
| is exactly **message** | `string` |
| is exactly **quizTitle** | `string` |
| is exactly **quizSynopsis** | `string` |
| is exactly **questionType** | `string` - reminder: valid types are 'single' and 'multiple' |
| is exactly **answers** | `Array` of objects, where each `object` contains keys `{isCorrect, answerString}` |
| is exactly **questions** | `Array` of objects, where each `object` contains keys `{questionId, questionString, questionType, answers}` |
| is exactly **quiz** | Object containing keys `{quizId, quizTitle, quizSynopsis, questions}` |
| is exactly **quizzes** | `Array` of objects, where each `object` contains the keys `{quizId, quizTitle}` |

## Task

### Testing

To test your code and *view the coverage results*:

<table>
    <tr>
        <th><b>Terminal 1 - Server</b></th>
        <th><b>Terminal 2 - Test</b></th>
    </tr>
    <tr>
        <td>
            Step 1: <code>$ npm run ts-node-coverage src/server.ts</code>
            <br/><br/>
        </td>
        <td>
        </td>
    </tr>
    <tr>
        <td>
        </td>
        <td>
            Step 2: <code>$ npm test</code>
        </td>
    </tr>
    <tr>
        <td>
            Step 3: <code>Ctrl+C</code> to close the server. Brief coverage details should be displayed.
        </td>
        <td>
        </td>
    </tr>
    <tr>
        <td>
            Step 4: Open <code>coverage/lcov-report/index.html</code> in a browser (e.g. Firefox/Google Chrome)
        </td>
        <td>
        </td>
    </tr>
</table>

#### TIP
- Step 4 only needs to be done once, you can refresh the `index.html` page after repeating steps 1-3 to get updated results.

### Implementation

In this lab, we recommend keeping your routes in [src/server.ts](src/server.ts) as wrappers around other functions.

Also, a reminder that for GET requests, data is transferred through the query string, whereas for PUT/POST/DELETE, this is done through the JSON body.

### Frontend

A prototype frontend for the forum application is hosted at:
- https://comp1531frontend.gitlab.io/quiz/home

To use the frontend, simply paste your backend URL (e.g. http://127.0.0.1:49152) into the input box.

While additional error checking has been built into the frontend, it is not uncommon to encounter a blank/white screen. This is usually attributed to having an incorrect return type in one of the routes from your backend, most commonly from `GET` requests such as `quiz/details` or `quizzes/list`.

### Share your experience!

Share your thoughts [HERE](https://cgi.cse.unsw.edu.au/~cs1531/redirect_activity/?activity=lab08_quiz) on any of the following:
1. How did you find this activity? What were the challenges?
1. What is something you learned from this activity?
1. Given the chance, which improvement would you make to the frontend or backend of this quiz application?
1. Without spoiling the lab, do you have any tips or resources that may help other students?

## Submission

- Use `git` to `add`, `commit`, and `push` your changes on your master branch.
- Check that your code has been uploaded to your Gitlab repository on this website (you may need to refresh the page).

**If you have pushed your latest changes to master on Gitlab no further action is required! At the due date and time, we automatically collect your work from what's on your master branch on Gitlab.**

## Additional Information

### Sample package.json

<details>

<summary>Click to view our sample package.json</summary><br/>

**Note**: 
1. The main keys to pay attention to are `"scripts"`, `"dependencies"` and `"devDependencies"`.
1. It is fine if the versions of your packages are newer.

```json
{
  "name": "lab08_quiz",
  "version": "1.0.0",
  "description": "[TOC]",
  "main": "src/server.ts",
  "scripts": {
    "ts-node": "ts-node",
    "ts-node-coverage": "nyc --reporter=text --reporter=lcov ts-node",
    "test": "jest src",
    "tsc": "tsc --noEmit",
    "lint": "eslint src/**.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/cors": "^2.8.12",
    "@types/express": "^4.17.13",
    "@types/http-errors": "^1.8.2",
    "@types/jest": "^27.5.1",
    "@types/morgan": "^1.9.3",
    "@typescript-eslint/eslint-plugin": "^5.23.0",
    "@typescript-eslint/parser": "^5.23.0",
    "eslint": "^8.15.0",
    "eslint-plugin-jest": "^26.2.1",
    "jest": "^28.1.0",
    "nodemon": "^2.0.16",
    "nyc": "^15.1.0",
    "sync-request": "^6.1.0",
    "ts-jest": "^28.0.2",
    "ts-node": "^10.7.0",
    "typescript": "^4.6.4"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.1",
    "http-errors": "^2.0.0",
    "middleware-http-errors": "^0.1.0",
    "morgan": "^1.10.0"
  }
}
```

</details># comp1531 lab08 quiz
# 加微信 powcoder

# [代做各类CS相关课程和程序语言](https://powcoder.com/)

# Programming Help Add Wechat powcoder

# Email: powcoder@163.com

[成功案例](https://powcoder.com/tag/成功案例/)

[java代写](https://powcoder.com/tag/java/) [c/c++代写](https://powcoder.com/tag/c/) [python代写](https://powcoder.com/tag/python/) [drracket代写](https://powcoder.com/tag/drracket/) [MIPS汇编代写](https://powcoder.com/tag/MIPS/) [matlab代写](https://powcoder.com/tag/matlab/) [R语言代写](https://powcoder.com/tag/r/) [javascript代写](https://powcoder.com/tag/javascript/)

[prolog代写](https://powcoder.com/tag/prolog/) [haskell代写](https://powcoder.com/tag/haskell/) [processing代写](https://powcoder.com/tag/processing/) [ruby代写](https://powcoder.com/tag/ruby/) [scheme代写](https://powcoder.com/tag/drracket/) [ocaml代写](https://powcoder.com/tag/ocaml/) [lisp代写](https://powcoder.com/tag/lisp/)

- [数据结构算法 data structure algorithm 代写](https://powcoder.com/category/data-structure-algorithm/)
- [计算机网络 套接字编程 computer network socket programming 代写](https://powcoder.com/category/network-socket/)
- [数据库 DB Database SQL 代写](https://powcoder.com/category/database-db-sql/)
- [机器学习 machine learning 代写](https://powcoder.com/category/machine-learning/)
- [编译器原理 Compiler 代写](https://powcoder.com/category/compiler/)
- [操作系统OS(Operating System) 代写](https://powcoder.com/category/操作系统osoperating-system/)
- [计算机图形学 Computer Graphics opengl webgl 代写](https://powcoder.com/category/computer-graphics-opengl-webgl/)
- [人工智能 AI Artificial Intelligence 代写](https://powcoder.com/category/人工智能-ai-artificial-intelligence/)
- [大数据 Hadoop Map Reduce Spark HBase 代写](https://powcoder.com/category/hadoop-map-reduce-spark-hbase/)
- [系统编程 System programming 代写](https://powcoder.com/category/sys-programming/)
- [网页应用 Web Application 代写](https://powcoder.com/category/web/)
- [自然语言处理 NLP natural language processing 代写](https://powcoder.com/category/nlp/)
- [计算机体系结构 Computer Architecture 代写](https://powcoder.com/category/computer-architecture/)
- [计算机安全密码学computer security cryptography 代写](https://powcoder.com/category/computer-security/)
- [计算机理论 Computation Theory 代写](https://powcoder.com/category/computation-theory/)
- [计算机视觉(Compute Vision) 代写](https://powcoder.com/category/计算机视觉compute-vision/)

