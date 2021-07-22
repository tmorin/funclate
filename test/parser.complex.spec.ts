import {expect} from "chai";
import {funclate} from "../src";

describe("parser/complex", function () {
    let el
    beforeEach(() => {
        if (el) {
            el.parentNode.removeChild(el)
        }
        el = document.body.appendChild(document.createElement("div"))
    })
    it("should handle sub funclate instances", function () {
        const template = funclate`<ul>start${funclate`<li>hello</li>`}middle${funclate`<li>world</li>`}end</ul>`
        template.render(el)
        expect(el.innerHTML).to.be.eq(`<ul>start<li>hello</li>middle<li>world</li>end</ul>`)
    })
    it("should handle list of sub funclate instance", function () {
        const list = ["itemA", "itemB", "itemC"]
        const template = funclate`<ul><li>header</li>${list.map(v => funclate`<li>${v}</li>`)}<li>footer</li></ul>`
        template.render(el)
        expect(el.innerHTML).to.be.eq(`<ul><li>header</li><li>itemA</li><li>itemB</li><li>itemC</li><li>footer</li></ul>`)
    })
})
