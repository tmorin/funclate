import {expect} from "chai"
import {Engine} from "../src"

describe("engine/replace", () => {
    let el
    beforeEach(() => {
        if (el) {
            el.parentNode.removeChild(el)
        }
        el = document.body.appendChild(document.createElement("div"))
    })
    it("should replace a comment by a text", () => {
        el.innerHTML = ""
        Engine.updateElement(el, (engine) => {
            engine.comment("a comment")
        })
        expect(el.innerHTML).to.be.eq("<!--a comment-->")
        Engine.updateElement(el, (engine) => {
            engine.text("a text")
        })
        expect(el.innerHTML).to.be.eq("a text")
    })
    it("should replace a `p` by an `input`", () => {
        el.innerHTML = ""
        Engine.updateElement(el, (engine) => {
            engine.openElement("p")
            engine.closeElement()
        })
        expect(el.innerHTML).to.be.eq("<p></p>")
        Engine.updateElement(el, (engine) => {
            engine.voidElement("input")
        })
        expect(el.innerHTML).to.be.eq("<input>")
    })
    it("should replace a text by an `input`", () => {
        el.innerHTML = ""
        Engine.updateElement(el, (engine) => {
            engine.text("a text")
        })
        expect(el.innerHTML).to.be.eq("a text")
        Engine.updateElement(el, (engine) => {
            engine.voidElement("input")
        })
        expect(el.innerHTML).to.be.eq("<input>")
    })
})
