var express = require('express');
var router = express.Router();
const authenticateAdmin = require('../middleware/middleware');
const dynamoDB = require('../config/dynamo.config');

//validation function
function validateParticipantData(data) {
    const requiredProperties = ['email', 'firstname', 'lastname', 'dob', 'active', 'work', 'home'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dobRegex = /^\d{4}\/\d{2}\/\d{2}$/;

    for (const property of requiredProperties) {
        if (!(property in data)) {
            return `Missing required property: ${property};`
        }
    }

    if (!emailRegex.test(data.email)) {
        return 'Invalid email address';
    }

    if (!dobRegex.test(data.dob)) {
        return 'Invalid date of birth format (YYYY/MM/DD)';
    }
    return null;
}

//to add new participent
// Sample
// {
//     "email": "johndoe@gmail.com",
//     "firstname": "john",
//     "lastname": "doe",
//     "dob": "2000/02/22",
//     "active": true,
//     "work": {
//         "companyname": "XYZCOmpanay",
//         "salary": 5000,
//         "currency": "USD"
//     },
//     "home": {
//         "country": "Pakistan",
//         "city": "Lahore"
//     }
// }
router.post('/add', authenticateAdmin, (req, res) => {
    const participantData = req.body;
    const validationError = validateParticipantData(participantData);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    const params = {
        TableName: 'Participants',
        Item: participantData,
    };
    dynamoDB.put(params, (err, data) => {
        if (err) {
            console.error('Error adding participant to DynamoDB:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            return res.json({ message: 'Participant added successfully' });
        }
    });
});

// Return all participents
router.get('/', authenticateAdmin, (req, res) => {
    const params = {
        TableName: 'Participants',
    };
    dynamoDB.scan(params, (err, data) => {
        if (err) {
            console.error('Error retrieving participants from DynamoDB:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const participants = data.Items || [];
            return res.json({ participants });
        }
    });

});

// Return all active participents personal details
router.get('/details', authenticateAdmin, (req, res) => {
    const params = {
        TableName: 'Participants',
        FilterExpression: '#active = :active',
        ProjectionExpression: 'email, firstname, lastname, dob',
        ExpressionAttributeNames: {
            '#active': 'active',
        },
        ExpressionAttributeValues: {
            ':active': true,
        },
    };

    dynamoDB.scan(params, (err, data) => {
        if (err) {
            console.error('Error retrieving active participants from DynamoDB:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const activeParticipantsPersonalDetails = data.Items || [];
            return res.json({ participants: activeParticipantsPersonalDetails });
        }
    });
});

// Return all deleted participents personal details
router.get('/details/deleted', authenticateAdmin, (req, res) => {
    const params = {
        TableName: 'Participants',
        FilterExpression: '#active = :active',
        ProjectionExpression: 'email, firstname, lastname, dob',
        ExpressionAttributeNames: {
            '#active': 'active',
        },
        ExpressionAttributeValues: {
            ':active': false,
        },
    };

    dynamoDB.scan(params, (err, data) => {
        if (err) {
            console.error('Error retrieving active participants from DynamoDB:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const deletedParticipantsPersonalDetails = data.Items || [];
            return res.json({ participants: deletedParticipantsPersonalDetails });
        }
    });
});

// Return active participent's personal details
router.get('/details/:email', authenticateAdmin, (req, res) => {
    const email = req.params.email;

    const params = {
        TableName: 'Participants',
        KeyConditionExpression: 'email = :emailVal',
        FilterExpression: '#active = :activeVal',
        ProjectionExpression: 'email, firstname, lastname, dob, #active',
        ExpressionAttributeNames: {
            '#active': 'active',
        },
        ExpressionAttributeValues: {
            ':emailVal': email,
            ':activeVal': true,
        },
    };


    dynamoDB.query(params, (err, data) => {
        if (err) {
            console.error(`Error retrieving participant with email ${email} from DynamoDB:`, err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log(data)
            const participant = data.Items;

            if (participant.length == 0) {
                return res.status(404).json({ error: 'Participant not found or deleted' });
            }

            return res.json({ participant: participant });
        }
    });
});

// Return active participent's work details
router.get('/details/work/:email', authenticateAdmin, (req, res) => {
    const email = req.params.email;

    const params = {
        TableName: 'Participants',
        KeyConditionExpression: 'email = :emailVal',
        FilterExpression: '#active = :activeVal',
        ProjectionExpression: '#work', 
        ExpressionAttributeNames: {
            '#work': 'work',
            '#active': 'active',
        },
        ExpressionAttributeValues: {
            ':emailVal': email,
            ':activeVal': true,
        },
    };

    dynamoDB.query(params, (err, data) => {
        if (err) {
            console.error(`Error retrieving participant with email ${email} from DynamoDB:`, err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const participant = data.Items;
            if (participant.length == 0) {
                return res.status(404).json({ error: 'Participant not found or deleted' });
            }
            return res.json({ participant: participant[0] });
        }
    });
});

// Return active participent's home details
router.get('/details/home/:email', authenticateAdmin, (req, res) => {
    const email = req.params.email;

    const params = {
        TableName: 'Participants',
        KeyConditionExpression: 'email = :emailVal',
        FilterExpression: '#active = :activeVal',
        ProjectionExpression: '#home', 
        ExpressionAttributeNames: {
            '#home': 'home',
            '#active': 'active',
        },
        ExpressionAttributeValues: {
            ':emailVal': email,
            ':activeVal': true,
        },
    };

    dynamoDB.query(params, (err, data) => {
        if (err) {
            console.error(`Error retrieving participant with email ${email} from DynamoDB:`, err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const participant = data.Items;
            if (participant.length == 0) {
                return res.status(404).json({ error: 'Participant not found or deleted' });
            }

            

            return res.json({ participant: participant[0] });
        }
    });
});

// Delete participent
router.delete('/:email', authenticateAdmin, (req, res) => {
    const email = req.params.email;
    console.log(email)
    if(!email){
        return res.status(400).json({ error: 'Email not provided!' });

    }
    const updateParams = {
        TableName: 'Participants',
        Key: {
            email: email,
        },
        UpdateExpression: 'SET #active = :newStatus',
        ConditionExpression: 'attribute_exists(#active)',
        ExpressionAttributeNames: {
            '#active': 'active',
        },
        ExpressionAttributeValues: {
            ':newStatus': false,
        },
        ReturnValues: 'ALL_NEW',
    };

    dynamoDB.update(updateParams, (err, data) => {
        if (err) {
            if (err.code === 'ConditionalCheckFailedException') {
                return res.status(404).json({ error: 'Participant not found' });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const {email, firstname, lastname, active } = data.Attributes;
            return res.json({
                message: 'Deleted successfully',
                participant: { email, firstname, lastname, active },
            });
        }
    });

});

// Update participent
router.put('/:email', authenticateAdmin, (req, res) => {
    const email = req.params.email;
    const updatedParticipantData = req.body;

    const validationError = validateParticipantData(updatedParticipantData);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const updateParams = {
        TableName: 'Participants',
        Key: {
            email: email,
        },
        UpdateExpression: `
        SET #firstname = :firstname,
            #lastname = :lastname,
            #dob = :dob,
            #active = :active,
            #work = :work,
            #home = :home
      `,
        ExpressionAttributeNames: {
            '#firstname': 'firstname',
            '#lastname': 'lastname',
            '#dob': 'dob',
            '#active': 'active',
            '#work': 'work',
            '#home': 'home',
        },
        ExpressionAttributeValues: {
            ':firstname': updatedParticipantData.firstname,
            ':lastname': updatedParticipantData.lastname,
            ':dob': updatedParticipantData.dob,
            ':active': updatedParticipantData.active,
            ':work': updatedParticipantData.work,
            ':home': updatedParticipantData.home,
        },
        ReturnValues: 'ALL_NEW',
    };

    dynamoDB.update(updateParams, (err, data) => {
        if (err) {
            if (err.code === 'ConditionalCheckFailedException') {
                return res.status(404).json({ error: 'Participant not found' });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const { firstname, lastname, dob, active, work, home } = data.Attributes;
            res.json({
                message: 'Participant updated successfully',
                participant: { email, firstname, lastname, dob, active, work, home },
            });
        }
    });
});

module.exports = router;


