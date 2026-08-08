const MAX_LATITUDE = 85.051129;

export type MercatorPoint = {
    x: number;
    y: number;
};

function clampLatitude(latitude: number): number {
    return Math.max(
        -MAX_LATITUDE,
        Math.min(MAX_LATITUDE, latitude),
    );
}

export function projectToMercator(
    longitude: number,
    latitude: number,
): MercatorPoint {
    const clampedLatitude = clampLatitude(latitude);

    const x = (longitude + 180) / 360;

    const latitudeRadians =
        (clampedLatitude * Math.PI) / 180;

    const y =
        (1 -
            Math.log(
                Math.tan(latitudeRadians) +
                1 / Math.cos(latitudeRadians),
            ) /
            Math.PI) /
        2;

    return {
        x,
        y,
    };
}

export function unprojectFromMercator(
    x: number,
    y: number,
): [number, number] {
    const longitude = x * 360 - 180;

    const latitudeRadians = Math.atan(
        Math.sinh(Math.PI * (1 - 2 * y)),
    );

    const latitude =
        (latitudeRadians * 180) / Math.PI;

    return [
        longitude,
        latitude,
    ];
}