# Balise SecondaryId Distribution

## Area-Specific ID Ranges

Each railway network area has been assigned a specific range of secondaryIds to ensure realistic data distribution:

| Area | Name              | SecondaryId Range | Count | Description                  |
| ---- | ----------------- | ----------------- | ----- | ---------------------------- |
| 1    | Uusimaa           | 10000 - 18299     | 8,300 | Helsinki metropolitan area   |
| 2    | Lounaisrannikko   | 18300 - 26599     | 8,300 | Southwest coast region       |
| 3    | Riihimäki-Kokkola | 26600 - 34899     | 8,300 | Central-western corridor     |
| 4    | Rauma-Pieksämäki  | 34900 - 43199     | 8,300 | Southwest-central connection |
| 5    | Haapamäki         | 43200 - 51499     | 8,300 | Haapamäki junction area      |
| 6    | Savo              | 51500 - 59799     | 8,300 | Savo region                  |
| 7    | Karjala           | 59800 - 68099     | 8,300 | Karelia region               |
| 8    | Yläsavo           | 68100 - 76399     | 8,300 | Upper Savo region            |
| 9    | Pohjanmaa         | 76400 - 84699     | 8,300 | Ostrobothnia region          |
| 10   | Keski-Suomi       | 84700 - 92999     | 8,300 | Central Finland              |
| 11   | Kainuu-Oulu       | 93000 - 99899     | 6,900 | Kainuu-Oulu region           |
| 12   | Oulu-Lappi        | 99900 - 99999     | 99    | Northern connection          |

**Total Items**: 99,999 balises across all areas

## Key Features

- **Sequential IDs**: Each area maintains its own sequential counter within its range
- **No Overlaps**: ID ranges are exclusive to each area
- **Realistic Distribution**: Based on actual Finnish railway network topology
- **Efficient Filtering**: Area-based filtering uses these ranges for optimal performance
- **Scalable Design**: Easy to modify ranges or add new areas

## Usage Examples

```typescript
// Get all balises in Uusimaa (area 1)
const uusimaaBalises = data.filter((item) => item.secondaryId >= 10000 && item.secondaryId <= 18299);

// Generate more data for a specific area
const newSavoData = getAllAreaData('Alue 6 Savon rata');
```

## Data Generation Logic

1. **Initial Load**: ~83 items per area (1,000 total)
2. **Area Selection**: Automatically loads more data for selected areas
3. **Infinite Scroll**: Mixed area data generation for general browsing
4. **Smart Loading**: Prioritizes areas with fewer loaded items
