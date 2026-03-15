export interface LegacyEntry {
  year: string; // e.g. "2017-18" — becomes the timeline title
  description: string; // shown above the toggle, always visible
  note?: string; // shown inside the expanded lineage panel
  roles: {
    label: string;
    subLabel?: string;
    members: string[];
  }[];
}

export const legacyData: LegacyEntry[] = [
  {
    year: '2017-18',
    description:
      'Tech Club was founded by a handful of enthusiasts who believed coding could be more than just syntax — it could be art, innovation, and expression.',
    note: 'The Tech Club is founded, and the core committee for the first year is established.',
    roles: [
      { label: 'President', members: ['Istasis Mishra'] },
      { label: 'Vice President', members: ['Aakash Agarwal'] },
      { label: 'Executives', members: ['Debaditya Pal', 'Dyutish Bandyopadhyay'] },
    ],
  },
  {
    year: '2018-19',
    description:
      'Club grew from 5 to 40+ members. Hosted its first intra-school hackathon, inspiring juniors to look beyond textbooks. Tech started becoming culture.',
    note: 'For some mysterious reason, we have no record of the core committee for the 2018-19 session. Trust me. We have tried.',
    roles: [{ label: 'President', members: ['Aakash Agarwal'] }],
  },
  {
    year: '2019-20',
    description:
      'The club grew up a little this year. Fewer questions about what it was, more clarity on what it could do. Departments took shape and people started finding their lanes.',
    note: 'The general executive position was discontinued 2019-20 onwards.',
    roles: [
      { label: 'President', members: ['Jatin Agarwala'] },
      {
        label: 'Executives',
        subLabel: 'Competitive Programming',
        members: ['Mainak Roy', 'Krittika Paul'],
      },
      { label: 'Executives', subLabel: 'Development', members: ['Kaustav Mukhopadhyay'] },
      { label: 'Executives', subLabel: 'Robotics', members: ['Aditya Ganguly', 'Preetraj Halder'] },
    ],
  },
  {
    year: '2020-21',
    description:
      'Despite lockdown, the club thrived online. Members ran webinars, bootcamps, and Discord-based collab nights. If anything, the distance made people show up harder.',
    note: 'The Vice President position is re-introduced in 2020-21.',
    roles: [
      { label: 'President', members: ['Krittika Paul'] },
      { label: 'Vice President', members: ['Ankkit Prakash'] },
      {
        label: 'Executives',
        subLabel: 'Competitive Programming',
        members: ['Ayan Das', 'Suvojit Ghosh', 'Anurag Ghosh'],
      },
      {
        label: 'Executives',
        subLabel: 'Development',
        members: ['Ankush Sarkar', 'Suchishmit Ghosh'],
      },
      {
        label: 'Executives',
        subLabel: 'Robotics',
        members: ['Prajeet Das', 'Ritwik Chakraborty', 'Shalini Gupta'],
      },
    ],
  },
  {
    year: '2021-22',
    description:
      'The work got quieter and more focused. Less figuring out, more shipping. Teams knew what they were building and who was building it — and that made all the difference',
    note: 'Executives for each department limited to 2 each, 2021-22 onwards.',
    roles: [
      { label: 'President', members: ['Suchishmit Ghosh'] },
      { label: 'Vice President', members: ['Archisman Das'] },
      {
        label: 'Executives',
        subLabel: 'Competitive Programming',
        members: ['Anushka Bhattacharji', 'Kaavya Mahajan'],
      },
      {
        label: 'Executives',
        subLabel: 'Development',
        members: ['Gaurav Choudhary', 'Shivansh Shalabh'],
      },
      { label: 'Executives', subLabel: 'Robotics', members: ['Divyesh Biswas', 'Aniruddha Dutta'] },
    ],
  },
  {
    year: '2022-23',
    description:
      'The year the club turned professional. GitHub repos were spun up, portfolio sites went live, and UI/UX stopped being an afterthought. The bar quietly raised itself.',
    note: 'The Director position was introduced to manage the now defunct "content team", in charge of social media posts and event banners.',
    roles: [
      { label: 'President', members: ['Shivansh Shalabh'] },
      { label: 'Vice President', members: ['Archisman Das'] },
      { label: 'Director', members: ['Suchishmit Ghosh'] },
      {
        label: 'Executives',
        subLabel: 'Competitive Programming',
        members: ['Stella Dey', 'Aryonna Pal'],
      },
      { label: 'Executives', subLabel: 'Development', members: ['Swapnil Dey', 'Pritish Dutta'] },
      { label: 'Executives', subLabel: 'Robotics', members: ['Aniruddha Dutta', 'Angshuman Basu'] },
    ],
  },
  {
    year: '2023-24',
    description:
      'Things got serious this year. More people, more responsibility, more to lose — and somehow, more to gain. The club was figuring out what it actually wanted to be.',
    note: 'The Director is positioned at the apex of the club, replacing the President. The club splits into the Tech Department and the Administrative Department, each with their own President and Vice President.',
    roles: [
      { label: 'Director', members: ['Swapnil Dey'] },
      { label: 'Tech President', members: ['Aniruddha Dutta'] },
      { label: 'Administrative President', members: ['Pritish Dutta'] },
      { label: 'Tech Vice President', members: ['Anjishnu Dey'] },
      { label: 'Administrative Vice President', members: ['Saloni Mondal', 'Divyesha Singh'] },
      {
        label: 'Executives',
        subLabel: 'Competitive Programming',
        members: ['Saptarshi Kar', 'Ayush Bhakta'],
      },
      {
        label: 'Executives',
        subLabel: 'Development',
        members: ['Arghya Sarkar', 'Vaibhav Prasad'],
      },
      { label: 'Executives', subLabel: 'Robotics', members: ['Soham Nandy', 'Darsh Bhalotia'] },
    ],
  },
  {
    year: '2024-25',
    description:
      'New year, new shape. The club made room for creativity alongside the code — design, video, and AI found their seat at the table. It started feeling like a proper team.',
    note: 'The Administrative Department is removed. The Creative Department is added under the Presidents and Vice Presidents. A new AI Department is started which has only one executive.',
    roles: [
      { label: 'Presidents', members: ['Anjishnu Dey', 'Soham Nandy'] },
      { label: 'Vice President', members: ['Arghya Sarkar'] },
      {
        label: 'Tech Executives',
        subLabel: 'Competitive Programming',
        members: ['Diptansu Roy', 'Parthiv Pal'],
      },
      {
        label: 'Tech Executives',
        subLabel: 'Development',
        members: ['Subhayan Niyogi', 'Vaibhav Prasad'],
      },
      {
        label: 'Tech Executives',
        subLabel: 'Robotics',
        members: ['Soham Saha', 'Anshuman Tripathy'],
      },
      { label: 'Tech Executives', subLabel: 'Artificial Intelligence', members: ['Ankush Roy'] },
      { label: 'Creative Executives', subLabel: 'Video', members: ['Md. Naumaan Khan'] },
      { label: 'Creative Executives', subLabel: 'Graphics', members: ['Adiya Roy'] },
    ],
  },
  {
    year: '2025-26',
    description:
      "Now with a new Discord server and website up and running, the Tech Club finally laid the foundation for an ever-expanding community of tech enthusiasts, learners and participants, to maintain the school's excellence in the technological domain.",
    roles: [
      { label: 'President', members: ['Arghya Sarkar'] },
      { label: 'Vice President', members: ['Ankush Roy'] },
      {
        label: 'Mentors',
        members: [
          'Anshuman Tripathy',
          'Avanindra Chakroborty',
          'Naitik Chattaraj',
          'Parthiv Pal',
          'Rishabh Das',
          'Sampreet Roy',
          'Shameek Dalal',
          'Soham Sen',
          'Soumili Dey',
        ],
      },
      { label: 'Offstage Executives', members: ['Aryaka Sikdar', 'Swapnil Basu'] },
      { label: 'Creative Executives', subLabel: 'Video', members: ['Prithuraj Saha'] },
      {
        label: 'Creative Executives',
        subLabel: 'Graphics',
        members: ['Adiya Roy', 'Niharika Paul'],
      },
      { label: 'Creative Executives', subLabel: 'PR Executive', members: ['Aritro Sen'] },
    ],
  },
];
