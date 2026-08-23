import himg from "@/public/h1.jpg";
import nimg from "@/public/n2.jpg";
import niimg from "@/public/n1.jpg";
import m1img from "@/public/m1.jpeg";
import m2img from "@/public/m2.jpeg";
import p1img from "@/public/p1.jpeg";
import default1 from "@/public/default1.png";

/**
 * Single source of truth for the team.
 *
 * /about and /team each hard-coded their own list: 7 members vs 5, with the same
 * person carrying two different subtitles ("PICT`28 CE" vs "PICT CE") and the
 * team page hard-coding the headline count "5".
 */
export const TEAM = [
  {
    img: himg,
    name: "Himanshu Gholse",
    subtitle: "PICT'26 ENTC",
    linkedin: "https://www.linkedin.com/in/himanshu-gholse-6604ba227/",
    github: "https://github.com/himanshug-08",
    email: "himanshugholse08@gmail.com",
  },
  {
    img: nimg,
    name: "Neeraj Magdum",
    subtitle: "PICT'26 CE",
    linkedin: "https://www.linkedin.com/in/neerajmagdum/",
    github: "https://github.com/nirz306",
    email: "neerajmagdum10@gmail.com",
  },
  {
    img: niimg,
    name: "Nilay Tayade",
    subtitle: "PICT'26 CE",
    linkedin: "https://www.linkedin.com/in/nilay-tayade/",
    github: "https://github.com/nilaytayade",
    email: "nilaytayadee@gmail.com",
  },
  {
    img: m1img,
    name: "Muneer Abbas",
    subtitle: "PICT'28 CE",
    linkedin: "https://www.linkedin.com/in/muneer-abass-67a095285/",
    github: "https://github.com/muneerabbas",
    email: "muneer.abbas5678@gmail.com",
  },
  {
    img: m2img,
    name: "Manas Khairnar",
    subtitle: "PICT'28 CE",
    linkedin: "https://www.linkedin.com/in/manas-khairnar-98329132b/",
    github: "https://github.com/derpx06",
    email: "manaskhairnar1511@gmail.com",
  },
  {
    img: p1img,
    name: "Parag Dharamkar",
    subtitle: "PICT'28 CE",
    linkedin: "https://www.linkedin.com/in/parag-dharamkar-b5529632a",
    github: "https://github.com/ParagD1606",
    email: "paragdharamkar2006@gmail.com",
  },
  {
    img: default1,
    name: "Riddhesh Kataria",
    subtitle: "PICT'28 CE",
  },
];

export const TEAM_COUNT = TEAM.length;
