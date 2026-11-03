# Personal Work files

Put each project's cover image in `thumbnails/` and its full-size photos in `images/`.

Add each project to `items.json` with its title, short summary, thumbnail path, and image paths. New entries go at the beginning of the list so the newest work appears first.

Example:

```json
[
  {
    "title": "Example project",
    "summary": "A short description of the project.",
    "thumbnail": "personal-work/thumbnails/example.jpg",
    "images": [
      "personal-work/images/example-1.jpg",
      "personal-work/images/example-2.jpg"
    ]
  }
]
```

Use JPG, PNG, or WebP images. Keep file names simple (letters, numbers, and hyphens) and make sure each path matches the uploaded file name exactly.
