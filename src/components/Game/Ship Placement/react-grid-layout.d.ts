declare module "react-grid-layout" {
  import * as React from "react";

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    id?: string;
  }
  type ItemCallback = (
    layout: Layout,
    oldItem: LayoutItem,
    newItem: LayoutItem,
    placeholder: LayoutItem,
    e: MouseEvent,
    element: HTMLElement
  ) => void;

  export interface ResponsiveProps {
    className?: string;
    cols?: { [key: string]: number };
    rows?: { [key: string]: number };
    breakpoints?: { [key: string]: number };
    layouts?: { [key: string]: Layout[] };
    margin?: [number, number];
    containerPadding?: [number, number];
    rowHeight?: number;
    rowWidth?: number;
    width?: number;
    allowOverlap? = boolean;
    onLayoutChange?: (
      currentLayout: Layout[],
      allLayouts: { [key: string]: Layout[] }
    ) => void;
    onBreakpointChange?: (newBreakpoint: string, newCols: number) => void;
    onWidthChange?: (
      containerWidth: number,
      margin: [number, number],
      cols: number,
      containerPadding: [number, number]
    ) => void;
    measureBeforeMount?: boolean;
    useCSSTransforms?: boolean;
    transformScale?: number;
    compactType?: "vertical" | "horizontal";
    preventCollision?: boolean;
    isDroppable?: boolean;
    resizeHandles?: string[];
    isResizable?: boolean;
    children?: React.ReactNode; // Add children property here
    onDrop?: (
      layout: Layout[],
      item: Layout,
      e: React.DragEvent<HTMLDivElement>
    ) => void; // Add onDrop property here
    onDragStart?: (e: React.DragEvent<HTMLDivElement>, item: Layout) => void; // Add onDragStart property here
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDropDragOver?: (e: DragOverEvent) => { w?: number; h?: number } | false;
    // onDragEnd?: (
    //   layout: Layout[],
    //   oldItemIndex: number,
    //   newItem: Layout
    // ) => void;
    // onDragStart?: (
    //   layout: Layout[],
    //   oldItemIndex: number,
    //   newItem: Layout
    // ) => void;
    onDrag?: (
      layout: Layout[],
      oldItemIndex: LayoutItem,
      newItem: Layout,
    ) => void;
    onDragStop?: (
      layout: Layout, oldItem: LayoutItem, newItem: LayoutItem,
      placeholder: LayoutItem, e: MouseEvent, element: HTMLElement
    ) => void;
  }

  export class Responsive extends React.Component<ResponsiveProps, {}> {}
  export function WidthProvider(
    component: typeof Responsive
  ): typeof Responsive;
}
