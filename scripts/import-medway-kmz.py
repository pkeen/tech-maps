"""Extract the reviewable Medway point data without inventing site or job links."""

import json
import sys
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

NAMESPACE = {"k": "http://www.opengis.net/kml/2.2"}
FOLDERS = {
    "Route A Points": ("medway-a", "Medway A"),
    "Route B": ("medway-b", "Medway B"),
    "Route C": ("medway-c", "Medway C"),
}


def extract(archive_path: Path) -> dict:
    with ZipFile(archive_path) as archive:
        root = ElementTree.fromstring(archive.read("doc.kml"))

    document = root.find("k:Document", NAMESPACE)
    if document is None:
        raise ValueError("KMZ has no KML Document")

    routes = []
    points = []
    folder_names = []
    for folder in document.findall("k:Folder", NAMESPACE):
        folder_name = folder.findtext("k:name", default="", namespaces=NAMESPACE)
        folder_names.append(folder_name)
        if folder_name == "Route A Driving":
            continue
        if folder_name not in FOLDERS:
            raise ValueError(f"Unexpected folder: {folder_name}")

        route_id, route_name = FOLDERS[folder_name]
        point_ids = []
        for placemark in folder.findall("k:Placemark", NAMESPACE):
            label = placemark.findtext("k:name", default="", namespaces=NAMESPACE)
            coordinate_text = placemark.findtext(
                "k:Point/k:coordinates", default="", namespaces=NAMESPACE
            )
            if not label or not coordinate_text:
                raise ValueError(f"Missing label or point coordinates in {folder_name}")
            longitude_text, latitude_text, *_ = coordinate_text.split(",")
            point_id = label.lower().replace("_", "-")
            if point_id in point_ids or any(point["id"] == point_id for point in points):
                raise ValueError(f"Duplicate point label: {label}")
            point_ids.append(point_id)
            points.append(
                {
                    "id": point_id,
                    "label": label,
                    "latitude": float(latitude_text),
                    "longitude": float(longitude_text),
                    "description": placemark.findtext(
                        "k:description", default="", namespaces=NAMESPACE
                    ),
                    "siteId": None,
                }
            )
        routes.append(
            {
                "id": route_id,
                "name": route_name,
                "sourceFolder": folder_name,
                "jobId": None,
                "pointIds": point_ids,
            }
        )

    if set(folder_names) != {*FOLDERS, "Route A Driving"}:
        raise ValueError(f"Unexpected KMZ folder set: {folder_names}")

    return {
        "source": {
            "archive": archive_path.name,
            "documentName": document.findtext("k:name", default="", namespaces=NAMESPACE),
            "excludedFolder": "Route A Driving",
            "orderBasis": "Placemark order within each KML Folder; visit order unverified",
        },
        "catchments": [],
        "jobs": [],
        "routes": routes,
        "sites": [],
        "points": points,
    }


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 import-medway-kmz.py input.kmz output.json")
    result = extract(Path(sys.argv[1]))
    Path(sys.argv[2]).write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
