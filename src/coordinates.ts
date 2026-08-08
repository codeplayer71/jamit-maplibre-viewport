export type Coordinate = [number, number];

export type CoordinateBounds = [
    Coordinate,
    Coordinate,
];

export function calculateCoordinateBounds(
    coordinates: Coordinate[],
): CoordinateBounds {
    if (coordinates.length === 0) {
        throw new Error('At least one coordinate is required.');
    }

    let minLongitude = coordinates[0]![0];
    let minLatitude = coordinates[0]![1];
    let maxLongitude = minLongitude;
    let maxLatitude = minLatitude;

    for (const [longitude, latitude] of coordinates) {
        minLongitude = Math.min(minLongitude, longitude);
        minLatitude = Math.min(minLatitude, latitude);
        maxLongitude = Math.max(maxLongitude, longitude);
        maxLatitude = Math.max(maxLatitude, latitude);
    }

    return [
        [minLongitude, minLatitude],
        [maxLongitude, maxLatitude],
    ];
}