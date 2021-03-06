
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/public-choice)

<a href="https://nodei.co/npm/public-choice/"><img src="https://nodei.co/npm/public-choice.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/public-choice">

# public-choice Web Component

Preliminary public polling web component.  Uses plurality voting.  [Do Not Use (Plurality Voting) In Production!!](https://shihn.ca/posts/2020/voting-systems/)

To progressively render the options before the element has upgraded, use a style such as:

```html
    <style>
      public-choice-jsonblob:not([data-upgraded]) datalist{
        display: block;
      }
      public-choice-jsonblob:not([data-upgraded]) [value]::before {
        content: attr(value) " ";
      }
    </style>
```

[Demo](https://bahrus.github.io/public-choice/)

Markup for Demo:

```html
  <div>
      <public-choice-jsonblob guid="951c3b69-3e16-4f62-915b-ba3ca33a8e78">
        <span slot="question">Rational choice theories of politics</span>
        <datalist slot="options">
          <option value="Assumes that individuals are naturally irrational and so should not be given a choice in important political decisions"></option>
          <option value="State that only humans are rational and therefore non-humans are not appropriate subjects of politics"></option>
          <option value="Assume that political parties and voters have the utility-maximizing characteristics of actors in the economic sphere"></option>
          <option value="Assume that voters tend to vote for parties based on the charisma of the party leader"></option>
        </datalist>
      </public-choice-jsonblob>

      <public-choice-jsonblob guid="0a924568-fcb7-4387-ae85-91a6fa41f789">
          <span slot="question">'If Option 1 is ranked higher than Option 2, then removing Option 3 should not alter the relative rankings of Options 1 and 2', this is the definition of which property of fairness?</span>
          <datalist slot="options">
            <option value="IIA"></option>
            <option value="Pareto Efficiency"></option>
            <option value="No Dictators"></option>
            <option value="None of These"></option>
            <option value="All of these could be correct."></option>
          </datalist>        
      </public-choice-jsonblob>


      <public-choice-jsonblob guid="d1b5f984-9216-4076-8ba1-36ad54edbc07">
          <span slot="question">Three sets of voters pick between three candidates: 
            <p>30% prefer A to B to C</p>
            <p>40% prefer B to C to A</p>
            <p>30% prefer C to A to B</p>
            <p>Suppose only the first choice counts, so B wins the election.</p>
            <p>However, if C was removed, A would win the election 60% to 40%.</p>
            <p>This is an example of violation of which principle?</p>
          </span>
          <datalist slot="options">
            <option value="Unanimity"></option>
            <option value="No Dicators"></option>
            <option value="IIA"></option>
          </datalist>        
      </public-choice-jsonblob>
```



