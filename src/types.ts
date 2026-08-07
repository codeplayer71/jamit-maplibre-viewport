export type OverlayEdge =
    | 'top'
    | 'right'
    | 'bottom'
    | 'left';

export type Rect = {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
};

export type OverlayRect = {
    edge: OverlayEdge;
    rect: Rect;
};

export type MapLibreViewportOverlay = {
    id: string;
    element: HTMLElement;
    edge: OverlayEdge;
};

export type ViewportPadding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

export type ViewportPaddingInput =
    | number
    | Partial<ViewportPadding>;

export type SafeArea = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type MapLibreViewport = {
    addOverlay: (overlay: MapLibreViewportOverlay) => void;
    removeOverlay: (id: string) => void;
    getSafeArea: () => SafeArea;
    getPadding: () => ViewportPadding;
    refresh: () => void;
    destroy: () => void;
};