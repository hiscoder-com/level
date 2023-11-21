import { supabaseService } from 'utils/supabaseService'
import supabaseApi from 'utils/supabaseServer'

function formationJSON(data) {
  function buildTree(items) {
    const tree = []
    const itemMap = {}

    items.forEach((item) => {
      item.children = []
      itemMap[item.id] = item
    })

    items.forEach((item) => {
      if (item.parent_id) {
        itemMap[item.parent_id].children.push(item)
      } else {
        tree.push(item)
      }
    })

    return tree
  }

  function removeIdsFromTree(tree) {
    function removeIdsFromItem(item) {
      delete item.id
      delete item.parent_id
      if (item.data && item.data.blocks) {
        item.data.blocks.forEach((block) => delete block.id)
      }
      item.children.forEach((child) => removeIdsFromItem(child))
    }

    tree.forEach((item) => removeIdsFromItem(item))

    return tree
  }

  const treeData = buildTree(data)

  const transformedData = removeIdsFromTree(treeData)

  return transformedData
}

export default async function PersonalNotesHandler(req, res) {
  try {
    let supabase
    try {
      supabase = await supabaseApi({ req, res })
    } catch (error) {
      return res.status(401).json({ error: 'Failed to initialize Supabase.' })
    }

    const {
      query: { user_id },
      method,
    } = req

    switch (method) {
      case 'GET':
        try {
          if (!user_id) {
            return res.status(400).json({ error: 'User ID is required.' })
          }

          const { data: personalNotesData, error: personalNotesError } =
            await supabaseService.rpc('get_personal_notes', {
              user_id_param: user_id,
            })

          if (personalNotesError) {
            return res.status(404).json({ personalNotesError })
          }
          const transformedData = formationJSON(personalNotesData)

          return res.status(200).json(transformedData)
        } catch (error) {
          console.error('Error:', error)
          return res.status(500).json({ error: 'Internal Server Error' })
        }
      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    return res.status(401).json({ error: 'Server error.' })
  }
}
