import { LitElement } from "lit-element";
import { EditorContext } from "@src/model/EditorContext";

export class EditorElement extends LitElement {
  context!: EditorContext;

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}