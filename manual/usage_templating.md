# Templating

## Interpolate values

```html
<div class="{{ el.dataset.clazz }}">{{ el.dataset.label }}</div>
```

## Interpolate properties

```html
<input type="date" #value-as-date="{{ el.aJsDate }}">
```

By default, properties are identified by the prefix `#`.

## if, else if and if clauses

```html
<strong>
    <fc-if fc-condition="el.condition === 'if'">
        if
    <fc-else-if fc-condition="el.condition === 'else-if'"/>
        else-if
    <fc-else/>
        else
    </fc-if>
</strong>
```

## for each loop

```html
<ul>
    <fc-each fc-items="el.items">
        <li value="{{ item.value }}">{{ item.label }}</li>
    </fc-each>
</ul>
```

## call another render function

```html
<ul>
    <fc-call name="anotherRenderFunction" />
</ul>
```

## element's key

In order to improve the DOM patching process, element can be identified with a key.
The key has to be unique within a children list.

For instance:
```html
<ul>
    <fc-each fc-items="el.items">
        <li key="item.value" value="{{ item.value }}">{{ item.label }}</li>
    </fc-each>
</ul>
```

## Light DOM node

**By the attribute `fc-content`**
```html
<div>
    <ul fc-content></ul>
</div>
```

**By the element `<fc-content></fc-content>`**
```html
<div>
    before
    <fc-content></fc-content>
    after
</div>
```
