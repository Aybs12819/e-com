interface MunicipalityFees {
  [key: string]: number;
}

interface MunicipalityDays {
  [key: string]: number;
}

interface RegionData {
  range: string;
  municipalities: MunicipalityFees;
  days?: MunicipalityDays;
}

interface ShippingFees {
  [key: string]: RegionData;
}

export const shippingFees: ShippingFees = {
  Nearby: {
    range: "₱80–₱120",
    municipalities: {
      Aguilar: 80,
      Bugallon: 100,
      Binmaley: 120,
      Labrador: 120,
    },
    days: {
      Aguilar: 1,
      Bugallon: 1,
      Binmaley: 1,
      Labrador: 1,
    },
  },
  "Mid-West Pangasinan": {
    range: "₱130–₱180",
    municipalities: {
      Lingayen: 150,
      Calasiao: 170,
      Mangaldan: 170,
      "San Fabian": 180,
      "San Carlos City": 150,
    },
    days: {
      Lingayen: 2,
      Calasiao: 2,
      Mangaldan: 2,
      "San Fabian": 2,
      "San Carlos City": 2,
    },
  },
  "Central Pangasinan": {
    range: "₱190–₱230",
    municipalities: {
      "Dagupan City": 200,
      Malasiqui: 200,
      Bayambang: 220,
      Basista: 200,
      "Santa Barbara": 220,
    },
    days: {
      "Dagupan City": 3,
      Malasiqui: 3,
      Bayambang: 3,
      Basista: 3,
      "Santa Barbara": 3,
    },
  },
  "Eastern / Southern Pangasinan": {
    range: "₱240–₱300",
    municipalities: {
      "Urdaneta City": 250,
      Binalonan: 260,
      Pozorrubio: 260,
      Rosales: 280,
      Villasis: 260,
      Asingan: 300,
    },
    days: {
      "Urdaneta City": 4,
      Binalonan: 4,
      Pozorrubio: 4,
      Rosales: 4,
      Villasis: 4,
      Asingan: 4,
    },
  },
  "Far West / Coastal / Mountain Areas": {
    range: "₱300–₱380",
    municipalities: {
      "Alaminos City": 320,
      Bolinao: 380,
      Anda: 360,
      Bani: 300,
      Mabini: 300,
      Dasol: 350,
      Infanta: 350,
      Burgos: 340,
    },
    days: {
      "Alaminos City": 5,
      Bolinao: 5,
      Anda: 5,
      Bani: 5,
      Mabini: 5,
      Dasol: 5,
      Infanta: 5,
      Burgos: 5,
    },
  },
  "Far East / Border Municipalities": {
    range: "₱320–₱400",
    municipalities: {
      Tayug: 350,
      "San Quintin": 330,
      "San Manuel": 330,
      "San Nicolas": 340,
      Umingan: 400,
      Natividad: 350,
      Laoac: 330,
    },
    days: {
      Tayug: 6,
      "San Quintin": 6,
      "San Manuel": 6,
      "San Nicolas": 6,
      Umingan: 6,
      Natividad: 6,
      Laoac: 6,
    },
  },
  "Other Municipalities": {
    range: "₱200–₱300 range",
    municipalities: {
      Agno: 200,
      Alcala: 240,
      Anda: 360,
      Balungao: 280,
      Bautista: 250,
      Mangatarem: 220,
      Mapandan: 240,
      Manaoag: 260,
      "San Jacinto": 240,
      "Santa Maria": 260,
      "Santo Tomas": 260,
      Sison: 280,
      Sual: 220,
      Urbiztondo: 220,
    },
    days: {
      Agno: 3,
      Alcala: 3,
      Anda: 3,
      Balungao: 3,
      Bautista: 3,
      Mangatarem: 3,
      Mapandan: 3,
      Manaoag: 3,
      "San Jacinto": 3,
      "Santa Maria": 3,
      "Santo Tomas": 3,
      Sison: 3,
      Sual: 3,
      Urbiztondo: 3,
    },
  },
};

export function getShippingFee(
  region: string,
  municipality: string
): number | undefined {
  const regionData = shippingFees[region];
  if (regionData) {
    return regionData.municipalities[municipality];
  }
  return undefined;
}

export function getEstimatedDays(
  region: string,
  municipality: string
): number | undefined {
  // First try direct region match
  const regionData = shippingFees[region];
  if (regionData && regionData.days) {
    const days = regionData.days[municipality];
    if (days) return days;
  }

  // If not found, search all regions for the municipality
  for (const [regionKey, regionData] of Object.entries(shippingFees)) {
    if (regionData.days && regionData.days[municipality]) {
      return regionData.days[municipality];
    }
  }

  return undefined;
}
