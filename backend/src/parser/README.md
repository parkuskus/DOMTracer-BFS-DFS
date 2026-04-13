

# Notes in regards to CSS Selector 
saya malas bikin notes di obsidian so might as well di sini aja. 

## Next-Sibling Combinator 
Denoted with this syntax: 
``` bash 
    first_element + target_element {style properties} 
    # basically we take an element that appears after the lefthand element 
    #example: 
    img + p { 
        font-weight: bold;
    } 

    # this means that for all paragraphs that appear right after an image, will be bolded. 
```
## Child Combinator 
Denoted with this syntax: 

``` bash 
    selector1 > selector2 { style propertie }
``` 

Basically what this means is that for every element that is just one depth below the parent element will use the specified styling properties. 

## Subsequent Sibling Combinator 
Denoted with this syntax: 
``` bash 
    former_element ~ target_element { style properties } 
```

The subsequent-sibling seperates two selectors and matches all instances of the second elemetn that follow the first element (not necessarily immediately) and share the same parent element. So like what this means is that if an element shares the same parent with the former_element, it will follow the styling properties. 

## Descendant Combinator 
Denoted with this syntax: 
``` bash 
    selector1 selector2 { style } 
```
Like basically Child Combinator but it generally goes infinitely until the parent's parent parent's you get it. 

## Namespace separator 
Denoted with this syntax: 
``` bash 
    namespace|element {property} 
```
I don't get it 
## Selector list 
Denoted with this syntax: 
``` bash 
    selector, selector_i, selector_n 
```
Same styles to n elements with different criterias. This can be denoted with comma seperated lists (obviously with \n). 
