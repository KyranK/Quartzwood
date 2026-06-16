# Quartzwood
*Physical MTG Collection Manager*

A MTG card collection traking tool. Designed with focus on the physical location of cards - as opposed to simply what cards are in a collection.
Currently is only a simple CLI -> see roadmap
---

## Stack

- Python · SQLModel · SQLite · Alembic
- Typer (CLI) · Rich (terminal tables)
- FastAPI · Jinja2 (read-only web UI)
- Scryfall API (card identity)

---

## Setup

Requires Python 3.11+ and Poetry.

```bash
git clone https://github.com/yourusername/quartzwood
cd quartzwood
poetry install
qw init
```

---

## Usage

Cards are identified by set number and set code, resolved via Scryfall:

```bash
qw add 187 MH3 NM                          # add a card
qw add 187 MH3 NM -s RedBinder -q 4        # add 4 copies to storage
qw add 187 MH3 NM -f surge                 # add a surge foil
```

### Collections & Storage

```bash
qw new-collection "Main"
qw new-storage "RedBinder" -c "Main"
qw view-collection "Main"
qw view-storage "RedBinder"
```

### Cards

```bash
qw list-cards
qw update 187 MH3 --new-condition LP
qw update 187 MH3 -c NM -S BlueBinder      # move NM copies to BlueBinder
qw rmv-cards 187 MH3 -c LP -s RedBinder
```

### Deleting Storage/Collections

```bash
qw rmv-storage "RedBinder" --relocate "BlueBinder"   # move cards first
qw rmv-storage "RedBinder" --force                   # orphan cards and delete
qw rmv-collection "Main" --relocate "Other"
qw rmv-collection "Main" --force
```

### Common Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--quantity` | `-q` | Number of copies (default: 1) |
| `--storage-name` | `-s` | Assign to storage |
| `--foil` | `-f` | Foil type |
| `--condition` | `-c` | Filter by condition |
| `--new-condition` | `-C` | Update condition |
| `--new-storage` | `-S` | Move to storage |
| `--relocate` | `-r` | Relocate children before delete |
| `--force` | | Orphan children and delete |

Run `qw --help` or `qw [command] --help` for full options.

---

## Web UI

```bash
qw-serve
```

Opens a read-only view at `http://127.0.0.1:8000`.

---

## Roadmap

- Entity model + card lending library
- Extending cli to Web-interface
- common mtg collection import/export system (i.e. moxfield)
- StorageBox rules
	- Auto sort decklists/collections 
- Selling interface
- Art alter tracking
- Postgres + auth for multi-user library feature
- Multi Libary setup/organizations

---

## Migrations

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```
