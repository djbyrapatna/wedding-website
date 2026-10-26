export interface Person {
  name: string;
  role: string;
  /** how this person is connected to the couple (e.g. "College friend") */
  relation?: string;
  photo: string; // filename in /public/images/photos/wedding-party/
}

export const BRIDESMAIDS: Person[] = [
  { name: "Chrislyn Herring", role: "Maid of Honor", relation: "Best friend", photo: "chrislyn.png" },
  { name: "Kayla Sager", role: "Matron of Honor", relation: "Sister-in-law of the bride", photo: "kayla.png" },
  { name: "Rebecca Wright", role: "Bridesmaid", relation: "Childhood friend", photo: "rebecca.jpg" },
  { name: "Bailey Cannon", role: "Bridesmaid", relation: "High school friend", photo: "bailey.jpg" },
  { name: "Gabby Kendrick", role: "Bridesmaid", relation: "College friend", photo: "gabby.png" },
  { name: "Nicole Hicks", role: "Bridesmaid", relation: "Sister of the groom", photo: "nicole.jpg" },
  { name: "Abby Sager", role: "Bridesmaid", relation: "Sister-in-law of the bride", photo: "abby.png" },
];

export const GROOMSMEN: Person[] = [
  { name: "Matthew Hicks", role: "Best Man", relation: "Brother of the groom", photo: "matthew.jpg" },
  { name: "Connor Sloan", role: "Groomsman", relation: "College friend", photo: "connor-sloan.png" },
  { name: "Patrick Hollander", role: "Groomsman", relation: "College friend", photo: "pat.png" },
  { name: "Jonathan Sager", role: "Groomsman", relation: "Brother of the bride", photo: "jonathan.jpg" },
  { name: "Connor Sager", role: "Groomsman", relation: "Brother of the bride", photo: "connor-sager.jpg" },
  { name: "Joe Calamore", role: "Groomsman", relation: "High school friend", photo: "joe.png" },
  { name: "Zach Agcaoili", role: "Groomsman", relation: "High school friend", photo: "zach.png" },
];

export const RING_BEARERS: Person[] = [
  { name: "Nolan Marchand", role: "Ring Bearer", photo: "nolan.jpg" },
  { name: "Lincoln Keif", role: "Ring Bearer", photo: "lincoln.png" },
];

export const FLOWER_GIRLS: Person[] = [
  { name: "Kenzie Steiner", role: "Flower Girl", photo: "kenzie.jpg" },
  { name: "Charley Keif", role: "Flower Girl", photo: "charley.jpg" },
];

export const PHOTO_BASE = "/images/photos/wedding-party";

