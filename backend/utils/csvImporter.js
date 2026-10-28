const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const CollegeCutoff = require('../models/CollegeCutoff');

// Stream JoSAA CSV records directly into MongoDB with deduplication
const importJosaaCutoffs = async (filePath) => {
  const targetPath = filePath || path.join(__dirname, '..', 'data', 'josaa_cutoffs.csv');

  if (!fs.existsSync(targetPath)) {
    throw new Error(`JoSAA CSV file not found at ${targetPath}`);
  }

  const previousYear = new Date().getFullYear() - 1;
  const aggregatedMap = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream(targetPath)
      .pipe(csv())
      .on('data', (row) => {
        const year = parseInt(row.Year || row.year);
        if (year !== previousYear && year !== 2024 && year !== 2023) return;

        const institute = (row.Institute || row.college || '').trim();
        const program = (row['Academic Program Name'] || row.branch || '').trim();
        const quota = (row.Quota || row.quota || '').trim();
        const seatType = (row['Seat Type'] || row.category || '').trim();
        const gender = (row.Gender || row.gender || '').trim();
        const openingRank = parseInt(row['Opening Rank'] || row.openingRank) || null;
        const closingRank = parseInt(row['Closing Rank'] || row.closingRank) || null;

        if (!institute || !program || !seatType || !gender || !closingRank) return;

        const isPwd = seatType.includes('(PwD)');
        const category = seatType.replace('(PwD)', '').trim();
        const branch = program.includes(' (') ? program.split(' (')[0].trim() : program;
        const exam = institute.toLowerCase().includes('indian institute of technology')
          ? 'JEE Advanced'
          : 'JEE Main';

        const key = `${institute}|${program}|${quota}|${category}|${gender}|${isPwd}`;

        if (!aggregatedMap.has(key)) {
          aggregatedMap.set(key, {
            year,
            exam,
            counsellingAuthority: 'JoSAA',
            college: institute,
            collegeType: institute.toLowerCase().includes('institute of technology') ? 'Government' : 'Other',
            course: 'B.Tech',
            branch,
            category,
            gender,
            pwd: isPwd,
            quota: quota === 'AI' ? 'All India' : quota === 'HS' ? 'Home State' : quota === 'OS' ? 'Other State' : quota,
            rankType: 'RANK',
            openingRank,
            closingRank,
          });
        } else {
          const existing = aggregatedMap.get(key);
          if (openingRank && (!existing.openingRank || openingRank < existing.openingRank)) {
            existing.openingRank = openingRank;
          }
          if (closingRank && (!existing.closingRank || closingRank > existing.closingRank)) {
            existing.closingRank = closingRank;
          }
        }
      })
      .on('end', async () => {
        try {
          const records = Array.from(aggregatedMap.values());
          console.log(`Parsed ${records.length} unique aggregated cutoff records.`);

          // Delete existing year data before refreshing
          await CollegeCutoff.deleteMany({ counsellingAuthority: 'JoSAA' });
          await CollegeCutoff.insertMany(records, { ordered: false });

          resolve(records.length);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
};

module.exports = { importJosaaCutoffs };
