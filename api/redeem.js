// Vercel Serverless Function — POST /api/redeem
// Validates a product key hash and marks it as used in Upstash Redis.

const VALID_KEY_HASHES = [
    "8a86acf30cf6c321", "bb60e1d228a9ea5f", "47b12f1147e58254", "e8f0e073be53c687",
    "335db85b1bd1a783", "15b2af4ec6f4416c", "58ad96ab42396a80", "b6c22177540334f1",
    "f5af4045f078d681", "b5c351266bbe4417", "243f4d5a4f9e36c5", "6e5e09e387353c17",
    "ed64f7ed6c6e37eb", "e640972949a47da1", "5f119ae1378885dd", "8e6db43561a3bb01",
    "efa691fc27be18b4", "eef5f827c6e49264", "b2bfcc2a6ab9ba33", "9c31fef9e4c4b0e2",
    "b6762bfca206d2b8", "5c6ebec785bbbb16", "64109879c45dc79b", "4013db72c5e51184",
    "63de129f8ed6ed5f", "54d6a925d6638da4", "cb521d1bf2c9c023", "97c69947edd98eb4",
    "6312f0cd37446c17", "b8ab50d72ba984f3", "df28e3300047f588", "b54b703eb9c56ff7",
    "4bc5914c5e223aca", "a8d1842baca7a484", "00045670ed5e76b5", "8a41069de6615f8a",
    "55c1cb68248e8b68", "954b788fc28e5668", "46da12ea136c1eb5", "e53e7fbb9209f3b2",
    "371a518f3a58d076", "859a9f83d5767814", "1de4d01ddbea4864", "529bd477bb6c56bd",
    "447ace3ade1bede4", "5baef43e35c007bc", "cb78b5b410861c3d", "9b486605b8fb1b6d",
    "9fe0e1f49d9245f4", "fbc6700cf6d2a572", "005abe59d86f1604", "93ef7e36d523954c",
    "8e4e732439dd3982", "12d65cf9ed6ecef4", "5e676bf8fe3902ac", "1924291a878fb241",
    "f83af6737d993da9", "c623b78b247948cb", "c00a2e2e006d0118", "7fe45707ad1268cc",
    "0decf0b29c7c47db", "3045971646669471", "76a29811e85b50d7", "2d4e98a8b37bdf78",
    "0072ee632d73677d", "cab75a23eed08b85", "95daea40c9c0f3cd", "b2df1e9ead4067a7",
    "5741914700fd0e42", "028afffa572b536e", "643b39dc480ff116", "d647f6ffd073c697",
    "c1efab9918de601f", "dc752ee52e06813b", "64182ba05331964a", "de750eae2350c36e",
    "8530e84bc9aa1ebc", "de722bb850459405", "c6db10a012551c64", "c63baadf9087f2b3",
    "8d899da540d80e3a", "181ec15b6323f649", "bd663b28c23d004f", "453aa188a7928aa2",
    "a392cc63e53a150a", "27d746939a46f190", "1790aa39a2d6bb3f", "77c7cb36b95d64c9",
    "e495aa8cb2b68305", "2c8b4e7729818704", "d6010d23cabd3869", "66cdb4a001bb4a60",
    "0285c89b3b03a939", "c87c4b0687a9c04c", "2ae506621887162a", "96ea03f315b7bc4c",
    "2c5a4eba389d273b", "5a9b9703eea12838", "16a95565b00c9a09", "533a8439a31b58ce",
];

async function redisCommand(command, args) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
        throw new Error("Missing Upstash env vars");
    }
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify([command, ...args]),
    });
    if (!res.ok) {
        throw new Error(`Redis error: ${res.status} ${await res.text()}`);
    }
    return (await res.json()).result;
}

// Helper: read raw body as a string then parse JSON
function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => { data += chunk; });
        req.on("end", () => {
            try { resolve(JSON.parse(data)); }
            catch { resolve({}); }
        });
        req.on("error", reject);
    });
}

module.exports = async function handler(req, res) {
    // CORS preflight
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    // Parse body manually (Vercel doesn't auto-parse)
    const body = await readBody(req);
    const { keyHash } = body;

    if (!keyHash || typeof keyHash !== "string" || keyHash.length !== 16) {
        return res.status(400).json({ ok: false, error: "Clé invalide." });
    }

    // 1. Is the key hash in the valid set?
    if (!VALID_KEY_HASHES.includes(keyHash)) {
        return res.status(400).json({ ok: false, error: "Clé invalide." });
    }

    try {
        // 2. Has it been used before?
        const alreadyUsed = await redisCommand("SISMEMBER", ["used_keys", keyHash]);
        if (alreadyUsed) {
            return res.status(400).json({ ok: false, error: "Cette clé a déjà été utilisée !" });
        }

        // 3. Mark as used
        await redisCommand("SADD", ["used_keys", keyHash]);
    } catch (err) {
        console.error("Redis error:", err);
        return res.status(500).json({ ok: false, error: "Erreur serveur, réessaye." });
    }

    return res.status(200).json({ ok: true });
};
