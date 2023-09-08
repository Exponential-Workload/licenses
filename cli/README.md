# Licenses CLI

1. Downloads GPL Licenses
2. Takes the licenses directory, and maps it into the following files:
   - `license-map.json`: A JSON file containing a list of SPDX Identifiers, and their corresponding hashes. This file is relatively small.<br/>
     The structure of this file is `{"spdx":{"md":"<hash>","txt":"<hash>",...},...}`
   - `licenses.json`: A JSON file containing a list of SPDX Identifiers, and their corresponding license text. This file is large.
   - `hashed/*`: A directory containing the license text files. The filenames are the hashes from `license-map.json`.
