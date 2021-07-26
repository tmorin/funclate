import {expect} from "chai";
import {funclate} from "../src";

describe("literal/simple", function () {
    let el
    beforeEach(() => {
        if (el) {
            el.parentNode.removeChild(el)
        }
        el = document.body.appendChild(document.createElement("div"))
    })
    it("should parse elements", function () {
        const template = funclate`<p>a text<input/><!--a comment--></p>`
        template.render(el)
        expect(el.innerHTML).to.be.eq("<p>a text<input><!--a comment--></p>")
    })
    it("should parse text node", function () {
        const name = "world"
        const template = funclate`<p>hello ${name}</p>`
        template.render(el)
        expect(el.innerHTML).to.be.eq(`<p>hello world</p>`)
    })
})
