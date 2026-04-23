// const Experience = require("../models/experience");
// const slugify = require("slugify");
// const request = require("request");
// const AsyncLock = require("async-lock");
// const experience = require("../models/experience");
// const lock = new AsyncLock();

// const MEDIUM_URL = "https://medium.com/@filipjerga/latest?format=json&limit=20";

// function parseFilters(queries) {
//   const parsedQueries = {};
//   if (queries.filter) {
//     Object.keys(queries).forEach(qKey => {
//       if (qKey.includes("filter")) {
//         const pKey = qKey.match(/\[([^)]+)\]/)[1];
//         parsedQueries[pKey] = queries[qKey];
//       }
//     });
//   }

//   return parsedQueries;
// }

// exports.getExperiences = (req, res) => {
//   const pageSize = parseInt(req.query.pageSize) || 0;
//   const pageNum = parseInt(req.query.pageNum) || 1;
//   const skips = pageSize * (pageNum - 1);
//   const filters = req.query.filter || {};

//   Experience.find({ status: "published", ...filters })
//     .sort({ updatedAt: -1 })
//     .populate("author -_id -password -products -email -role")
//     .skip(skips)
//     .limit(pageSize)
//     .exec(function (errors, publishedExperiences) {
//       if (errors) {
//         return res.status(422).send(errors);
//       }

//       Experience.countDocuments({ status: "published" }).then(count => {
//         return res.json({
//           experiences: publishedExperiences,
//           count,
//           pageCount: Math.ceil(count / pageSize)
//         });
//       });
//     });
// };

// exports.getMediumExperiences = (req, res) => {
//   request.get(MEDIUM_URL, (err, apiRes, body) => {
//     if (!err && apiRes.statusCode === 200) {
//       let i = body.indexOf("{");
//       const data = body.substr(i);
//       res.send(data);
//     } else {
//       res.sendStatus(500).json(err);
//     }
//   });
// };

// exports.getExperienceBySlug = (req, res) => {
//   const slug = req.params.slug;

//   Experience.findOne({ slug })
//     .populate("author -_id -password -products -email -role")
//     .exec(function (errors, foundExperience) {
//       if (errors) {
//         return res.status(422).send(errors);
//       }

//       return res.json(foundExperience);
//     });
// };

// exports.getExperienceById = (req, res) => {
//   const experienceId = req.params.id;

//   Experience.findOne({ _id: experienceId })
//     .populate("author -_id -password -products -email -role")
//     .exec(function (errors, foundExperience) {
//       if (errors) {
//         return res.status(422).send(errors);
//       }

//       return res.json(foundExperience);
//     });
//   /* Experience.findById(experienceId, (errors, foundExperience) => {
//     if (errors) {
//       console.log(errors)
//       return res.status(422).send(errors);
//     }
//     console.log(foundExperience)
//     return res.json(foundExperience);
//   }); */
// };

// exports.getUserExperiences = (req, res) => {
//   const user = req.user;

//   Experience.find({ author: user.id }, function (errors, userExperiences) {
//     if (errors) {
//       return res.status(422).send(errors);
//     }

//     return res.json(userExperiences);
//   }).sort({ "createdAt": -1 });

// };

// exports.updateExperience = (req, res) => {
//   const experienceId = req.params.id;
//   const experienceData = req.body;

//   Experience.findById(experienceId, function (errors, foundExperience) {
//     if (errors) {
//       return res.status(422).send(errors);
//     }

//     // if (experienceData.status && experienceData.status === 'published' && !foundExperience.slug) {
//     if (experienceData.status && experienceData.status === "published") {
//       foundExperience.slug = slugify(foundExperience.title, {
//         replacement: "-", // replace spaces with replacement
//         remove: null, // regex to remove characters
//         lower: true // result in lower case
//       });
//     }

//     foundExperience.set(experienceData);
//     foundExperience.updatedAt = new Date();
//     foundExperience.save(function (errors, foundExperience) {
//       if (errors) {
//         return res.status(422).send(errors);
//       }

//       return res.json(foundExperience);
//     });
//   });
// };

// exports.createExperience = (req, res) => {
//   const lockId = req.query.lockId;

//   if (!lock.isBusy(lockId)) {
//     lock.acquire(
//       lockId,
//       function (done) {
//         const experienceData = req.body;
//         const experience = new Experience(experienceData);
//         experience.author = req.user;

//         experience.save((errors, createdExperience) => {
//           setTimeout(() => done(), 5000);

//           if (errors) {
//             return res.status(422).send(errors);
//           }

//           return res.json(createdExperience);
//         });
//       },
//       function (errors, ret) {
//         errors && console.error(errors);
//       }
//     );
//   } else {
//     return res.status(422).send({ message: "Experience is getting saved!" });
//   }
// };

// exports.deleteExperience = (req, res) => {
//   const experienceId = req.params.id;

//   Experience.deleteOne({ _id: experienceId }, function (errors) {
//     if (errors) {
//       return res.status(422).send(errors);
//     }

//     res.json({ status: "deleted" });
//   });
// };

import type { Experience as ExperienceType } from '~~/server/models/types/experience'
import type { H3Event } from '#imports'
import AsyncLock from 'async-lock'
import slugify from 'slugify'
import Experience from '~~/server/models/experience'
import '~~/server/models/user'

const lock = new AsyncLock()

interface ExperienceFilters {
  status?: string
  [key: string]: any
}

interface PaginationQuery {
  pageSize?: string
  pageNum?: string
  filter?: ExperienceFilters
}

function parseFilters(queries: any) {
  const parsedQueries: any = {}
  if (queries.filter) {
    Object.keys(queries).forEach((qKey) => {
      if (qKey.includes('filter')) {
        const pKey = qKey.match(/\[([^)]+)\]/)?.[1]
        if (pKey) {
          parsedQueries[pKey] = queries[qKey]
        }
      }
    })
  }
  return parsedQueries
}

export async function getExperiences(event: H3Event) {
  // return 'This endpoint is currently disabled for development purposes. Please check back later.'

  try {
    const query = getQuery(event) as PaginationQuery

    // const url = getRequestURL(event)
    // const query = Object.fromEntries(url?.searchParams ?? [])
    const pageSize = Number.parseInt(query.pageSize || '0') || 0
    const pageNum = Number.parseInt(query.pageNum || '1') || 1
    const skips = pageSize * (pageNum - 1)
    const filters = query.filter || {}

    const publishedExperiences = await Experience.find({ status: 'published', ...filters })
      .sort({ updatedAt: -1 })
      // .populate('author', '-_id -password -products -email -role')
      .skip(skips)
      .limit(pageSize)
      .exec()

    const count = await Experience.countDocuments({ status: 'published' })

    return {
      experiences: publishedExperiences,
      count,
      pageCount: Math.ceil(count / pageSize),
    }
  }
  catch (error) {
    throw createError({ statusCode: 422, message: error instanceof Error ? error.message : 'Failed to fetch experiences' })
  }
}

export async function getExperienceBySlug(event: any) {
  try {
    const slug = getRouterParam(event, 'slug')

    const foundExperience = await Experience.findOne({ slug })
      .populate('author', '-_id -password -products -email -role')
      .exec()

    return foundExperience
  }
  catch (error) {
    throw createError({
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Failed to fetch experience by slug',
    })
  }
}

export async function getExperienceById(event: any) {
  try {
    const experienceId = getRouterParam(event, 'id')

    const foundExperience = await Experience.findOne({ _id: experienceId })
      .populate('author', '-_id -password -products -email -role')
      .exec()

    return foundExperience
  }
  catch (error) {
    throw createError({ statusCode: 422, message: 'Failed to fetch experience by ID' })
  }
}

export async function getUserExperiences(event: any) {
  try {
    const session = await requireUserSession(event)

    // Ensure the ID exists and is a valid format before querying
    const sessionUser = session?.user as Record<string, any>
    if (!sessionUser) {
      throw new Error('User not authenticated')
    }

    const userExperiences = await Experience.find({ author: sessionUser._id })
      .sort({ createdAt: -1 })
      .exec()

    return userExperiences
  }
  catch (error) {
    throw createError({ statusCode: 422, message: error instanceof Error ? error.message : 'Failed to fetch user experiences' })
  }
}

export async function createExperience(event: any) {
  try {
    const query = getQuery(event)
    const lockId = query.lockId as string

    // return 'This endpoint is currently disabled for development purposes. Please check back later.'

    if (!lock.isBusy(lockId)) {
      return new Promise((resolve, reject) => {
        lock.acquire(
          lockId,
          async (done) => {
            try {
              const experienceData = await readBody<ExperienceType>(event)
              const experience = new Experience(experienceData)
              experience.author = event.context.user

              const createdExperience = await experience.save()
              setTimeout(done, 5000)
              resolve(createdExperience)
            }
            catch (error) {
              done()
              reject(createError({ statusCode: 422, message: 'Failed to create experience' }))
            }
          },
          (errors) => {
            if (errors) {
              console.error(errors)
              reject(createError({ statusCode: 422, message: 'Lock acquisition failed' }))
            }
          },
        )
      })
    }
    else {
      throw createError({ statusCode: 422, message: 'Experience is getting saved!' })
    }
  }
  catch (error) {
    throw createError({ statusCode: 422, message: 'Failed to create experience' })
  }
}

export async function updateExperience(event: any) {
  try {
    const experienceId = getRouterParam(event, 'id')
    const experienceData = await readBody<ExperienceType>(event)

    const foundExperience = await Experience.findById(experienceId)

    if (!foundExperience || !experienceData) {
      throw createError({ statusCode: 404, message: 'Experience not found' })
    }

    if (experienceData?.status && experienceData.status === 'published') {
      foundExperience.slug = slugify(foundExperience.title, {
        replacement: '-',
        lower: true,
      })
    }

    foundExperience.set(experienceData)
    foundExperience.updatedAt = new Date()

    const savedExperience = await foundExperience.save()
    return savedExperience
  }
  catch (error) {
    throw createError({ statusCode: 422, message: 'Failed to update experience' })
  }
}

export async function deleteExperience(event: any) {
  try {
    const experienceId = getRouterParam(event, 'id')

    await Experience.deleteOne({ _id: experienceId })
    return { status: 'deleted' }
  }
  catch (error) {
    throw createError({ statusCode: 422, message: 'Failed to delete experience' })
  }
}
