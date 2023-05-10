#include <vector>
#include <string>
#include <string.h>
#include <iostream>
#include <sstream>
#include "transformer.h"

using namespace std;

// Global delays.
int mouseDelay = 10;
int keyboardDelay = 10;

/*
 __  __
|  \/  | ___  _   _ ___  ___
| |\/| |/ _ \| | | / __|/ _ \
| |  | | (_) | |_| \__ \  __/
|_|  |_|\___/ \__,_|___/\___|

*/

int CheckMouseButton(const char *const b, MMMouseButton *const button)
{
    if (!button)
        return -1;

    if (strcmp(b, "left") == 0)
    {
        *button = LEFT_BUTTON;
    }
    else if (strcmp(b, "right") == 0)
    {
        *button = RIGHT_BUTTON;
    }
    else if (strcmp(b, "middle") == 0)
    {
        *button = CENTER_BUTTON;
    }
    else
    {
        return -2;
    }

    return 0;
}

void dragMouseMediator(string params)
{
    vector<int32_t> nums = toInts(params);

    MMMouseButton button = LEFT_BUTTON;

    MMSignedPoint point;
    point = MMSignedPointMake(nums[0], nums[1]);
    dragMouse(point, button);
    microsleep(mouseDelay);
}

void moveMouseMediator(string params)
{
    vector<int32_t> nums = toInts(params);
    MMSignedPoint point;
    point = MMSignedPointMake(nums[0], nums[1]);
    moveMouse(point);
    microsleep(mouseDelay);
}

void mouseClickMediator(string params)
{
    MMMouseButton button = LEFT_BUTTON;
    bool doubleC = false;

    vector<string> strs = toStrings2(params);
    int size = strs.size();

    CheckMouseButton(strs[0].c_str(), &button);

    if (size == 2)
    {
        doubleC = strs[1] == "true";
    }

    if (!doubleC)
    {
        clickMouse(button);
    }
    else
    {
        doubleClick(button);
    }

    microsleep(mouseDelay);
}

void mouseToggleMediator(string params)
{
    MMMouseButton button = LEFT_BUTTON;
    bool down = false;

    vector<string> strs = toStrings2(params);
    int size = strs.size();

    if (strcmp(strs[0].c_str(), "down") == 0)
    {
        down = true;
    }
    else if (strcmp(strs[0].c_str(), "up") == 0)
    {
        down = false;
    }

    if (size == 2)
    {
        CheckMouseButton(strs[1].c_str(), &button);
    }

    toggleMouse(down, button);
    microsleep(mouseDelay);
}

/*
 _  __          _                         _
| |/ /___ _   _| |__   ___   __ _ _ __ __| |
| ' // _ \ | | | '_ \ / _ \ / _` | '__/ _` |
| . \  __/ |_| | |_) | (_) | (_| | | | (_| |
|_|\_\___|\__, |_.__/ \___/ \__,_|_|  \__,_|
          |___/
*/
struct KeyNames
{
    const char *name;
    MMKeyCode key;
};

static KeyNames key_names[] =
    {
        {"backspace", K_BACKSPACE},
        {"delete", K_DELETE},
        {"enter", K_RETURN},
        {"tab", K_TAB},
        {"escape", K_ESCAPE},
        {"up", K_UP},
        {"down", K_DOWN},
        {"right", K_RIGHT},
        {"left", K_LEFT},
        {"home", K_HOME},
        {"end", K_END},
        {"pageup", K_PAGEUP},
        {"pagedown", K_PAGEDOWN},
        {"f1", K_F1},
        {"f2", K_F2},
        {"f3", K_F3},
        {"f4", K_F4},
        {"f5", K_F5},
        {"f6", K_F6},
        {"f7", K_F7},
        {"f8", K_F8},
        {"f9", K_F9},
        {"f10", K_F10},
        {"f11", K_F11},
        {"f12", K_F12},
        {"f13", K_F13},
        {"f14", K_F14},
        {"f15", K_F15},
        {"f16", K_F16},
        {"f17", K_F17},
        {"f18", K_F18},
        {"f19", K_F19},
        {"f20", K_F20},
        {"f21", K_F21},
        {"f22", K_F22},
        {"f23", K_F23},
        {"f24", K_F24},
        {"capslock", K_CAPSLOCK},
        {"command", K_META},
        {"alt", K_ALT},
        {"right_alt", K_RIGHT_ALT},
        {"control", K_CONTROL},
        {"left_control", K_LEFT_CONTROL},
        {"right_control", K_RIGHT_CONTROL},
        {"shift", K_SHIFT},
        {"right_shift", K_RIGHTSHIFT},
        {"space", K_SPACE},
        {"printscreen", K_PRINTSCREEN},
        {"insert", K_INSERT},
        {"menu", K_MENU},

        {"audio_mute", K_AUDIO_VOLUME_MUTE},
        {"audio_vol_down", K_AUDIO_VOLUME_DOWN},
        {"audio_vol_up", K_AUDIO_VOLUME_UP},
        {"audio_play", K_AUDIO_PLAY},
        {"audio_stop", K_AUDIO_STOP},
        {"audio_pause", K_AUDIO_PAUSE},
        {"audio_prev", K_AUDIO_PREV},
        {"audio_next", K_AUDIO_NEXT},
        {"audio_rewind", K_AUDIO_REWIND},
        {"audio_forward", K_AUDIO_FORWARD},
        {"audio_repeat", K_AUDIO_REPEAT},
        {"audio_random", K_AUDIO_RANDOM},

        {"numpad_lock", K_NUMPAD_LOCK},
        {"numpad_0", K_NUMPAD_0},
        {"numpad_0", K_NUMPAD_0},
        {"numpad_1", K_NUMPAD_1},
        {"numpad_2", K_NUMPAD_2},
        {"numpad_3", K_NUMPAD_3},
        {"numpad_4", K_NUMPAD_4},
        {"numpad_5", K_NUMPAD_5},
        {"numpad_6", K_NUMPAD_6},
        {"numpad_7", K_NUMPAD_7},
        {"numpad_8", K_NUMPAD_8},
        {"numpad_9", K_NUMPAD_9},
        {"numpad_+", K_NUMPAD_PLUS},
        {"numpad_-", K_NUMPAD_MINUS},
        {"numpad_*", K_NUMPAD_MULTIPLY},
        {"numpad_/", K_NUMPAD_DIVIDE},
        {"numpad_.", K_NUMPAD_DECIMAL},

        {"lights_mon_up", K_LIGHTS_MON_UP},
        {"lights_mon_down", K_LIGHTS_MON_DOWN},
        {"lights_kbd_toggle", K_LIGHTS_KBD_TOGGLE},
        {"lights_kbd_up", K_LIGHTS_KBD_UP},
        {"lights_kbd_down", K_LIGHTS_KBD_DOWN},

        {NULL, K_NOT_A_KEY} /* end marker */
};

int CheckKeyCodes(char *k, MMKeyCode *key)
{
    if (!key)
        return -1;

    if (strlen(k) == 1)
    {
        *key = keyCodeForChar(*k);
        return 0;
    }

    *key = K_NOT_A_KEY;

    KeyNames *kn = key_names;
    while (kn->name)
    {
        if (strcmp(k, kn->name) == 0)
        {
            *key = kn->key;
            break;
        }
        kn++;
    }

    if (*key == K_NOT_A_KEY)
    {
        return -2;
    }

    return 0;
}

int CheckKeyFlags(char *f, MMKeyFlags *flags)
{
    if (!flags)
        return -1;

    if (strcmp(f, "alt") == 0 || strcmp(f, "right_alt") == 0)
    {
        *flags = MOD_ALT;
    }
    else if (strcmp(f, "command") == 0)
    {
        *flags = MOD_META;
    }
    else if (strcmp(f, "control") == 0 || strcmp(f, "right_control") == 0 || strcmp(f, "left_control") == 0)
    {
        *flags = MOD_CONTROL;
    }
    else if (strcmp(f, "shift") == 0 || strcmp(f, "right_shift") == 0)
    {
        *flags = MOD_SHIFT;
    }
    else if (strcmp(f, "none") == 0)
    {
        *flags = MOD_NONE;
    }
    else
    {
        return -2;
    }

    return 0;
}

int GetFlagsFromString(string v, MMKeyFlags *flags)
{
    char *str = (char *)v.c_str();
    return CheckKeyFlags(str, flags);
}

int GetFlagsFromValue(vector<string> value, MMKeyFlags *flags)
{
    if (!flags)
        return -1;

    // Optionally allow an array of flag strings to be passed.
    if (value.size() > 1)
    {
        for (uint32_t i = 1; i < value.size(); i++)
        {
            MMKeyFlags f = MOD_NONE;
            const int rv = GetFlagsFromString(value[i], &f);
            if (rv)
                return rv;

            *flags = (MMKeyFlags)(*flags | f);
        }
        return 0;
    }

    return -1;
}

void keyTapMediator(string params)
{
    MMKeyFlags flags = MOD_NONE;
    MMKeyCode key;

    char *k;

    vector<string> strs = toStrings2(params);
    int size = strs.size();

    k = (char *)strs[0].c_str();

    if (size > 1)
    {
        GetFlagsFromValue(strs, &flags);
    }

    CheckKeyCodes(k, &key);

    toggleKeyCode(key, true, flags);
    microsleep(keyboardDelay);
    toggleKeyCode(key, false, flags);
    microsleep(keyboardDelay);
}