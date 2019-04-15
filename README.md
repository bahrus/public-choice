
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/public-choice)

<a href="https://nodei.co/npm/public-choice/"><img src="https://nodei.co/npm/public-choice.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/public-choice">

# public-choice Web Component

Preliminary public polling web component.  Do Not Use In Production.

[Demo](https://bahrus.github.io/public-choice/)

Markup for Demo:

```html
  <div>
    <public-choice guid="951c3b69-3e16-4f62-915b-ba3ca33a8e77">
      <span slot="question">What is your favorite pronoun?</span>
      <datalist slot="options">
        <option value="He"></option>
        <option value="She"></option>
        <option value="They"></option>
        <option value="Ze"></option>
        <option value="A pronoun not listed"></option>
        <option value="No pronoun preference"></option>
      </datalist>
    </public-choice>

    <public-choice guid="0a924568-fcb7-4387-ae85-91a6fa41f788">
        <span slot="question">Do you approve of this poll?</span>
        <datalist slot="options">
          <option value="Yes"></option>
          <option value="No"></option>
          <option value="Maybe"></option>
          
        </datalist>        
    </public-choice>


    <public-choice guid="d1b5f984-9216-4076-8ba1-36ad54edbc06">
        <span slot="question">Do you look more like your?</span>
        <datalist slot="options">
          <option value="Mother"></option>
          <option value="Father"></option>
          <option value="Neither"></option>
          
        </datalist>        
    </public-choice>
    <script type="module" src="https://unpkg.com/public-choice@0.0.1/public-choice.js?module"></script>
  </div>
```



