import { html, customElement, property } from "lit-element";
import { EditorElement } from "./EditorElement";
import { defaultWidth } from "./Layout";
import { Logger } from "@src/core/Logger";
import { createVisualization } from "@src/core/Visualization";
import { Bus } from "@src/core/Event";
import { Table } from "@src/core/store/Table";
import { getData } from "@src/core/Helper";
import "./visualization/Table";
import "./visualization/Column";

const HEIGHT = 1200;
const MARGIN = 20;

@customElement("vuerd-visualization")
class Visualization extends EditorElement {
  @property({ type: Number })
  width = defaultWidth;
  @property({ type: Boolean })
  preview = false;
  @property({ type: Boolean })
  drag = false;
  @property({ type: Object })
  table: Table | null = null;
  @property({ type: String })
  columnId: string | null = null;

  private selection!: any;
  private x = 0;
  private y = 0;

  connectedCallback() {
    super.connectedCallback();
    Logger.debug("Visualization connectedCallback");
    const { store, eventBus } = this.context;
    this.selection = createVisualization(store, eventBus) as any;
    this.setViewBox();
    this.subscriptionList.push(
      eventBus
        .on(Bus.Visualization.startPreview)
        .subscribe(this.onStartPreview),
      eventBus.on(Bus.Visualization.endPreview).subscribe(this.onEndPreview),
      eventBus.on(Bus.Visualization.dragStart).subscribe(this.onDragStart),
      eventBus.on(Bus.Visualization.dragEnd).subscribe(this.onDragEnd)
    );
  }
  updated(changedProperties: any) {
    Logger.debug("Visualization updated");
    changedProperties.forEach((oldValue: any, propName: string) => {
      switch (propName) {
        case "width":
          this.setViewBox();
          break;
      }
    });
  }

  render() {
    Logger.debug("Visualization render");
    return html`
      <div class="vuerd-visualization" @mousemove=${this.onMousemove}>
        ${this.selection.node()}
        ${this.table && !this.drag && this.preview
          ? html`
              <vuerd-visualization-table
                .table=${this.table}
                .columnId=${this.columnId}
                .top=${this.y - MARGIN}
                .left=${this.x + MARGIN}
              ></vuerd-visualization-table>
            `
          : ""}
      </div>
    `;
  }

  private onStartPreview = (event: CustomEvent) => {
    const { tableId, columnId } = event.detail;
    const { tables } = this.context.store.tableState;
    this.preview = true;
    this.table = getData(tables, tableId);
    this.columnId = columnId;
  };
  private onEndPreview = (event: CustomEvent) => {
    this.preview = false;
  };
  private onDragStart = (event: CustomEvent) => {
    this.drag = true;
  };
  private onDragEnd = (event: CustomEvent) => {
    this.drag = false;
  };

  private onMousemove(event: MouseEvent) {
    this.x = event.x;
    this.y = event.y;
  }

  private setViewBox() {
    this.selection.attr("viewBox", [
      -this.width / 2,
      -HEIGHT / 2,
      this.width,
      HEIGHT,
    ]);
  }
}
