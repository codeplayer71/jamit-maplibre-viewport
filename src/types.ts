import type {
    EaseToOptions,
    FitBoundsOptions,
    FlyToOptions,
    LngLatBoundsLike,
} from 'maplibre-gl';

export type MapLibreMapLike = {
    getContainer: () => HTMLElement;
    getMinZoom: () => number;
    getMaxZoom: () => number;
    getBearing: () => number;
    getPitch: () => number;

    fitBounds: (
        bounds: LngLatBoundsLike,
        options?: FitBoundsOptions,
    ) => unknown;

    flyTo: (
        options: FlyToOptions,
    ) => unknown;

    easeTo: (
        options: EaseToOptions,
    ) => unknown;
};

export type OverlayEdge =
    | 'top'
    | 'right'
    | 'bottom'
    | 'left';

export type Coordinate = [number, number];

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

export type ViewportFitBoundsOptions =
    Omit<FitBoundsOptions, 'padding'> & {
    padding?: ViewportPaddingInput;
};

export type ViewportFitCoordinatesOptions =
    Omit<
        EaseToOptions,
        'center' | 'zoom' | 'padding' | 'offset'
    > & {
    padding?: ViewportPaddingInput;
    minZoom?: number;
    maxZoom?: number;
    zoomStep?: number;
};

export type ViewportFlyToOptions =
    Omit<FlyToOptions, 'padding'> & {
    padding?: ViewportPaddingInput;
};

export type ViewportEaseToOptions =
    Omit<EaseToOptions, 'padding'> & {
    padding?: ViewportPaddingInput;
};

export type MapLibreViewport = {
    addOverlay: (overlay: MapLibreViewportOverlay) => void;
    removeOverlay: (id: string) => void;
    getSafeArea: () => SafeArea;
    getPadding: () => ViewportPadding;

    fitBounds: (
        bounds: LngLatBoundsLike,
        options?: ViewportFitBoundsOptions,
    ) => void;

    fitCoordinates: (
        coordinates: Coordinate[],
        options?: ViewportFitCoordinatesOptions,
    ) => void;

    flyTo: (options: ViewportFlyToOptions) => void;

    easeTo: (options: ViewportEaseToOptions) => void;

    refresh: () => void;
    destroy: () => void;
};