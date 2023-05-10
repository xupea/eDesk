#include <string>
#include "transformer.h"

#if defined(USE_X11)
#include "../vender/robotjs/xdisplay.h"
#endif

using namespace std;

int main()
{
    string input;

    while (1)
    {
        while (getline(cin, input))
        {
            vector<string> params = toStrings(input);
            // moveMouse 100,100
            if (params[0] == "moveMouse")
            {
                moveMouseMediator(params[1]);
            }
            else if (params[0] == "mouseClick")
            {
                mouseClickMediator(params[1]);
            }
            else if (params[0] == "mouseToggle")
            {
                mouseToggleMediator(params[1]);
            }
            else if (params[0] == "dragMouse")
            {
                dragMouseMediator(params[1]);
            }
            else if (params[0] == "keyTap")
            {
                keyTapMediator(params[1]);
            }
            cout << input << endl;
        }
    }

    return 0;
}