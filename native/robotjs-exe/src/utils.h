#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include "../vender/robotjs/inline_keywords.h"

using namespace std;

H_INLINE vector<int32_t> toInts(string params)
{
    vector<int32_t> nums;
    istringstream iss(params);
    string s;
    while (getline(iss, s, ','))
    {
        nums.push_back(stoi(s));
    }
    return nums;
}

H_INLINE vector<string> toStrings(string params)
{
    vector<string> strs;
    istringstream iss(params);
    string s;
    while (getline(iss, s, ' '))
    {
        strs.push_back((s));
    }
    return strs;
}

H_INLINE vector<string> toStrings2(string params)
{
    vector<string> strs;
    istringstream iss(params);
    string s;
    while (getline(iss, s, ','))
    {
        strs.push_back((s));
    }
    return strs;
}